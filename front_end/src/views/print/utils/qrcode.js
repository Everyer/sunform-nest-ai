/**
 * 零依赖的极轻量级 QR Code (二维码) 矩阵生成器
 * 原理基于经典二维码编码规格，根据内容输出二维 boolean 矩阵，在 Vue 中直接用 SVG rect 渲染。
 */

// 二维码核心编码对象
const QRCodeAlg = {
  // 纠错级别
  ErrorCorrectLevel: { L: 1, M: 0, Q: 3, H: 2 },

  // 生成二维码矩阵数据
  generate: function(text, errorCorrectLevel) {
    const ecLevel = errorCorrectLevel === undefined ? this.ErrorCorrectLevel.M : errorCorrectLevel;
    const qr = new QRCodeModel(-1, ecLevel);
    qr.addData(text);
    qr.make();
    
    const count = qr.getModuleCount();
    const matrix = [];
    for (let r = 0; r < count; r++) {
      const row = [];
      for (let c = 0; c < count; c++) {
        row.push(qr.isDark(r, c));
      }
      matrix.push(row);
    }
    return {
      size: count,
      matrix: matrix
    };
  }
};

// 内部实现：QRCode 核心模型
function QRCodeModel(typeNumber, errorCorrectLevel) {
  this.typeNumber = typeNumber;
  this.errorCorrectLevel = errorCorrectLevel;
  this.modules = null;
  this.moduleCount = 0;
  this.dataCache = null;
  this.dataList = [];
}

QRCodeModel.prototype = {
  addData: function(data) {
    const newData = new QR8bitByte(data);
    this.dataList.push(newData);
    this.dataCache = null;
  },
  isDark: function(row, col) {
    if (row < 0 || this.moduleCount <= row || col < 0 || this.moduleCount <= col) {
      return false;
    }
    return this.modules[row][col];
  },
  getModuleCount: function() {
    return this.moduleCount;
  },
  make: function() {
    if (this.typeNumber < 1) {
      let typeNumber = 1;
      for (typeNumber = 1; typeNumber < 40; typeNumber++) {
        const rsBlocks = QRRSBlock.getRSBlocks(typeNumber, this.errorCorrectLevel);
        const buffer = new QRBitBuffer();
        const totalDataCount = rsBlocks.reduce((acc, b) => acc + b.dataCount, 0);
        for (let i = 0; i < this.dataList.length; i++) {
          const data = this.dataList[i];
          buffer.put(data.mode, 4);
          buffer.put(data.getLength(), QRUtil.getLengthInBits(data.mode, typeNumber));
          data.write(buffer);
        }
        if (buffer.getLengthInBits() <= totalDataCount * 8) break;
      }
      this.typeNumber = typeNumber;
    }
    this.makeImpl(false, this.getBestMaskPattern());
  },
  makeImpl: function(test, maskPattern) {
    this.moduleCount = this.typeNumber * 4 + 17;
    this.modules = new Array(this.moduleCount);
    for (let row = 0; row < this.moduleCount; row++) {
      this.modules[row] = new Array(this.moduleCount);
      for (let col = 0; col < this.moduleCount; col++) {
        this.modules[row][col] = null;
      }
    }
    this.setupPositionProbePattern(0, 0);
    this.setupPositionProbePattern(this.moduleCount - 7, 0);
    this.setupPositionProbePattern(0, this.moduleCount - 7);
    this.setupPositionAdjustPattern();
    this.setupTimingPattern();
    this.setupTypeInfo(test, maskPattern);
    if (this.typeNumber >= 7) {
      this.setupTypeNumber(test);
    }
    if (this.dataCache == null) {
      this.dataCache = QRCodeModel.createData(this.typeNumber, this.errorCorrectLevel, this.dataList);
    }
    this.mapData(this.dataCache, maskPattern);
  },
  setupPositionProbePattern: function(row, col) {
    for (let r = -1; r <= 7; r++) {
      if (row + r <= -1 || this.moduleCount <= row + r) continue;
      for (let c = -1; c <= 7; c++) {
        if (col + c <= -1 || this.moduleCount <= col + c) continue;
        if ((0 <= r && r <= 6 && (c == 0 || c == 6)) || (0 <= c && c <= 6 && (r == 0 || r == 6)) || (2 <= r && r <= 4 && 2 <= c && c <= 4)) {
          this.modules[row + r][col + c] = true;
        } else {
          this.modules[row + r][col + c] = false;
        }
      }
    }
  },
  getBestMaskPattern: function() {
    let minLostPoint = 0;
    let bestMaskPattern = 0;
    for (let i = 0; i < 8; i++) {
      this.makeImpl(true, i);
      const lostPoint = QRUtil.getLostPoint(this);
      if (i == 0 || minLostPoint > lostPoint) {
        minLostPoint = lostPoint;
        bestMaskPattern = i;
      }
    }
    return bestMaskPattern;
  },
  setupTimingPattern: function() {
    for (let r = 8; r < this.moduleCount - 8; r++) {
      if (this.modules[r][6] != null) continue;
      this.modules[r][6] = (r % 2 == 0);
    }
    for (let c = 8; c < this.moduleCount - 8; c++) {
      if (this.modules[6][c] != null) continue;
      this.modules[6][c] = (c % 2 == 0);
    }
  },
  setupPositionAdjustPattern: function() {
    const pos = QRUtil.getPatternPosition(this.typeNumber);
    for (let i = 0; i < pos.length; i++) {
      for (let j = 0; j < pos.length; j++) {
        const row = pos[i];
        const col = pos[j];
        if (this.modules[row][col] != null) continue;
        for (let r = -2; r <= 2; r++) {
          for (let c = -2; c <= 2; c++) {
            if (Math.abs(r) == 2 || Math.abs(c) == 2 || (r == 0 && c == 0)) {
              this.modules[row + r][col + c] = true;
            } else {
              this.modules[row + r][col + c] = false;
            }
          }
        }
      }
    }
  },
  setupTypeNumber: function(test) {
    const bits = QRUtil.getBCHTypeNumber(this.typeNumber);
    for (let i = 0; i < 18; i++) {
      const mod = (!test && ((bits >> i) & 1) == 1);
      this.modules[Math.floor(i / 3)][i % 3 + this.moduleCount - 8 - 3] = mod;
    }
    for (let i = 0; i < 18; i++) {
      const mod = (!test && ((bits >> i) & 1) == 1);
      this.modules[i % 3 + this.moduleCount - 8 - 3][Math.floor(i / 3)] = mod;
    }
  },
  setupTypeInfo: function(test, maskPattern) {
    const data = (this.errorCorrectLevel << 3) | maskPattern;
    const bits = QRUtil.getBCHTypeInfo(data);
    for (let i = 0; i < 15; i++) {
      const mod = (!test && ((bits >> i) & 1) == 1);
      if (i < 6) {
        this.modules[i][8] = mod;
      } else if (i < 8) {
        this.modules[i + 1][8] = mod;
      } else {
        this.modules[this.moduleCount - 15 + i][8] = mod;
      }
    }
    for (let i = 0; i < 15; i++) {
      const mod = (!test && ((bits >> i) & 1) == 1);
      if (i < 8) {
        this.modules[8][this.moduleCount - i - 1] = mod;
      } else if (i < 9) {
        this.modules[8][15 - i - 1 + 1] = mod;
      } else {
        this.modules[8][15 - i - 1] = mod;
      }
    }
    this.modules[this.moduleCount - 8][8] = !test;
  },
  mapData: function(data, maskPattern) {
    let inc = -1;
    let row = this.moduleCount - 1;
    let bitIndex = 7;
    let byteIndex = 0;
    for (let col = this.moduleCount - 1; col > 0; col -= 2) {
      if (col == 6) col--;
      while (true) {
        for (let c = 0; c < 2; c++) {
          const currentCol = col - c;
          if (this.modules[row][currentCol] == null) {
            let dark = false;
            if (byteIndex < data.length) {
              dark = (((data[byteIndex] >>> bitIndex) & 1) == 1);
            }
            const mask = QRUtil.getMask(maskPattern, row, currentCol);
            if (mask) {
              dark = !dark;
            }
            this.modules[row][currentCol] = dark;
            bitIndex--;
            if (bitIndex == -1) {
              byteIndex++;
              bitIndex = 7;
            }
          }
        }
        row += inc;
        if (row < 0 || this.moduleCount <= row) {
          row -= inc;
          inc = -inc;
          break;
        }
      }
    }
  }
};

QRCodeModel.createData = function(typeNumber, errorCorrectLevel, dataList) {
  const rsBlocks = QRRSBlock.getRSBlocks(typeNumber, errorCorrectLevel);
  const buffer = new QRBitBuffer();
  for (let i = 0; i < dataList.length; i++) {
    const data = dataList[i];
    buffer.put(data.mode, 4);
    buffer.put(data.getLength(), QRUtil.getLengthInBits(data.mode, typeNumber));
    data.write(buffer);
  }
  let totalDataCount = 0;
  for (let i = 0; i < rsBlocks.length; i++) {
    totalDataCount += rsBlocks[i].dataCount;
  }
  if (buffer.getLengthInBits() > totalDataCount * 8) {
    throw new Error("code length overflow. (" + buffer.getLengthInBits() + ">" + totalDataCount * 8 + ")");
  }
  if (buffer.getLengthInBits() + 4 <= totalDataCount * 8) {
    buffer.put(0, 4);
  }
  while (buffer.getLengthInBits() % 8 != 0) {
    buffer.putBit(false);
  }
  while (true) {
    if (buffer.getLengthInBits() >= totalDataCount * 8) break;
    buffer.put(QRCodeModel.PAD0, 8);
    if (buffer.getLengthInBits() >= totalDataCount * 8) break;
    buffer.put(QRCodeModel.PAD1, 8);
  }
  return QRCodeModel.createBytes(buffer, rsBlocks);
};

QRCodeModel.PAD0 = 0xEC;
QRCodeModel.PAD1 = 0x11;

QRCodeModel.createBytes = function(buffer, rsBlocks) {
  let offset = 0;
  let maxDcCount = 0;
  let maxEcCount = 0;
  const dcData = new Array(rsBlocks.length);
  const ecData = new Array(rsBlocks.length);
  for (let r = 0; r < rsBlocks.length; r++) {
    const dcCount = rsBlocks[r].dataCount;
    const ecCount = rsBlocks[r].totalCount - dcCount;
    maxDcCount = Math.max(maxDcCount, dcCount);
    maxEcCount = Math.max(maxEcCount, ecCount);
    dcData[r] = new Array(dcCount);
    for (let i = 0; i < dcData[r].length; i++) {
      dcData[r][i] = 0xff & buffer.buffer[i + offset];
    }
    offset += dcCount;
    const rsPoly = QRUtil.getErrorCorrectPolynomial(ecCount);
    const rawPoly = new QRPolynomial(dcData[r], rsPoly.getLength() - 1);
    const modPoly = rawPoly.mod(rsPoly);
    ecData[r] = new Array(rsPoly.getLength() - 1);
    for (let i = 0; i < ecData[r].length; i++) {
      const num = i + modPoly.getLength() - ecData[r].length;
      ecData[r][i] = (num >= 0) ? modPoly.get(num) : 0;
    }
  }
  let totalCodeCount = 0;
  for (let i = 0; i < rsBlocks.length; i++) {
    totalCodeCount += rsBlocks[i].totalCount;
  }
  const data = new Array(totalCodeCount);
  let index = 0;
  for (let i = 0; i < maxDcCount; i++) {
    for (let r = 0; r < rsBlocks.length; r++) {
      if (i < dcData[r].length) {
        data[index++] = dcData[r][i];
      }
    }
  }
  for (let i = 0; i < maxEcCount; i++) {
    for (let r = 0; r < rsBlocks.length; r++) {
      if (i < ecData[r].length) {
        data[index++] = ecData[r][i];
      }
    }
  }
  return data;
};

// 模式
const QRMode = { MODE_8BIT_BYTE: 4 };

// 8位字节数据
function QR8bitByte(data) {
  this.mode = QRMode.MODE_8BIT_BYTE;
  this.data = data;
}
QR8bitByte.prototype = {
  getLength: function() { return this.data.length; },
  write: function(buffer) {
    for (let i = 0; i < this.data.length; i++) {
      buffer.put(this.data.charCodeAt(i), 8);
    }
  }
};

// 数学工具与纠错
function QRPolynomial(num, shift) {
  if (num.length === undefined) throw new Error(num.length + "/" + shift);
  let offset = 0;
  while (offset < num.length && num[offset] == 0) offset++;
  this.num = new Array(num.length - offset + shift);
  for (let i = 0; i < num.length - offset; i++) this.num[i] = num[i + offset];
  for (let i = num.length - offset; i < this.num.length; i++) this.num[i] = 0;
}
QRPolynomial.prototype = {
  get: function(index) { return this.num[index]; },
  getLength: function() { return this.num.length; },
  multiply: function(e) {
    const num = new Array(this.getLength() + e.getLength() - 1);
    for (let i = 0; i < this.getLength(); i++) {
      for (let j = 0; j < e.getLength(); j++) {
        num[i + j] ^= QRMath.gexp(QRMath.glog(this.get(i)) + QRMath.glog(e.get(j)));
      }
    }
    return new QRPolynomial(num, 0);
  },
  mod: function(e) {
    if (this.getLength() - e.getLength() < 0) return this;
    const ratio = QRMath.glog(this.get(0)) - QRMath.glog(e.get(0));
    const num = new Array(this.getLength());
    for (let i = 0; i < this.getLength(); i++) num[i] = this.get(i);
    for (let i = 0; i < e.getLength(); i++) {
      num[i] ^= QRMath.gexp(QRMath.glog(e.get(i)) + ratio);
    }
    return new QRPolynomial(num, 0).mod(e);
  }
};

// RS 块纠错
function QRRSBlock(totalCount, dataCount) {
  this.totalCount = totalCount;
  this.dataCount = dataCount;
}
QRRSBlock.RS_BLOCK_TABLE = [
  // 1-10
  [1, 26, 19], [1, 26, 16], [1, 26, 13], [1, 26, 9],
  [1, 44, 34], [1, 44, 28], [1, 44, 22], [1, 44, 16],
  [1, 70, 55], [1, 70, 44], [2, 35, 17], [2, 35, 13],
  [1, 100, 80], [2, 50, 32], [2, 50, 24], [4, 25, 9],
  [1, 134, 108], [2, 67, 43], [2, 33, 15, 2, 34, 16], [2, 33, 11, 2, 34, 12],
  [2, 86, 68], [4, 43, 27], [4, 43, 19], [4, 43, 15],
  [2, 98, 78], [4, 49, 31], [2, 32, 14, 4, 33, 15], [4, 39, 13, 1, 40, 14],
  [2, 121, 97], [2, 22, 12, 2, 23, 13], [4, 30, 12, 2, 31, 13], [4, 24, 9, 4, 25, 10],
  [2, 146, 116], [3, 23, 11, 2, 24, 12], [4, 28, 12, 4, 29, 13], [4, 18, 8, 4, 19, 9],
  [2, 86, 68, 2, 87, 69], [4, 38, 22, 1, 39, 23], [6, 23, 11, 2, 24, 12], [6, 19, 8, 2, 20, 9]
];
QRRSBlock.getRSBlocks = function(typeNumber, errorCorrectLevel) {
  const list = [];
  const index = (typeNumber - 1) * 4 + errorCorrectLevel;
  const rawData = QRRSBlock.RS_BLOCK_TABLE[index];
  if (!rawData) return [new QRRSBlock(26, 19)]; // 兜底
  for (let i = 0; i < rawData.length; i += 3) {
    if (rawData[i] === undefined) break;
    const count = rawData[i];
    const totalCount = rawData[i + 1];
    const dataCount = rawData[i + 2];
    for (let j = 0; j < count; j++) {
      list.push(new QRRSBlock(totalCount, dataCount));
    }
  }
  return list;
};

// 伽罗华域 GF(2^8) 数学乘法对数表
const QRMath = {
  glog: function(n) { if (n < 1) return 0; return this.LOG_TABLE[n]; },
  gexp: function(n) { while (n < 0) n += 255; while (n >= 255) n -= 255; return this.EXP_TABLE[n]; },
  EXP_TABLE: new Array(256),
  LOG_TABLE: new Array(256)
};
for (let i = 0; i < 8; i++) QRMath.EXP_TABLE[i] = 1 << i;
for (let i = 8; i < 256; i++) QRMath.EXP_TABLE[i] = QRMath.EXP_TABLE[i - 4] ^ QRMath.EXP_TABLE[i - 5] ^ QRMath.EXP_TABLE[i - 6] ^ QRMath.EXP_TABLE[i - 8];
for (let i = 0; i < 255; i++) QRMath.LOG_TABLE[QRMath.EXP_TABLE[i]] = i;

// 缓冲区
function QRBitBuffer() { this.buffer = []; this.length = 0; }
QRBitBuffer.prototype = {
  get: function(index) {
    const bufIndex = Math.floor(index / 8);
    return ((this.buffer[bufIndex] >>> (7 - index % 8)) & 1) == 1;
  },
  put: function(num, length) {
    for (let i = 0; i < length; i++) {
      this.putBit(((num >>> (length - i - 1)) & 1) == 1);
    }
  },
  getLengthInBits: function() { return this.length; },
  putBit: function(bit) {
    const bufIndex = Math.floor(this.length / 8);
    if (this.buffer.length <= bufIndex) this.buffer.push(0);
    if (bit) this.buffer[bufIndex] |= (0x80 >>> (this.length % 8));
    this.length++;
  }
};

// 工具方法
const QRUtil = {
  PATTERN_POSITION_TABLE: [
    [], [6, 18], [6, 22], [6, 26], [6, 30], [6, 34], [6, 22, 38], [6, 24, 42], [6, 26, 46], [6, 28, 50],
    [6, 30, 54], [6, 32, 58], [6, 34, 62], [6, 26, 46, 66], [6, 26, 48, 70], [6, 26, 50, 74], [6, 30, 54, 78], [6, 30, 56, 82], [6, 30, 58, 86], [6, 34, 62, 90]
  ],
  G15: (1 << 10) | (1 << 8) | (1 << 5) | (1 << 4) | (1 << 2) | (1 << 1) | (1 << 0),
  G18: (1 << 12) | (1 << 11) | (1 << 10) | (1 << 9) | (1 << 5) | (1 << 2) | (1 << 1) | (1 << 0),
  G15_MASK: (1 << 14) | (1 << 12) | (1 << 10) | (1 << 4) | (1 << 1) | (1 << 0),
  getBCHTypeInfo: function(data) {
    let r = data << 10;
    while (QRUtil.getBCHDigit(r) - QRUtil.getBCHDigit(QRUtil.G15) >= 0) {
      r ^= (QRUtil.G15 << (QRUtil.getBCHDigit(r) - QRUtil.getBCHDigit(QRUtil.G15)));
    }
    return ((data << 10) | r) ^ QRUtil.G15_MASK;
  },
  getBCHTypeNumber: function(data) {
    let r = data << 12;
    while (QRUtil.getBCHDigit(r) - QRUtil.getBCHDigit(QRUtil.G18) >= 0) {
      r ^= (QRUtil.G18 << (QRUtil.getBCHDigit(r) - QRUtil.getBCHDigit(QRUtil.G18)));
    }
    return (data << 12) | r;
  },
  getBCHDigit: function(data) {
    let digit = 0;
    while (data != 0) { digit++; data >>>= 1; }
    return digit;
  },
  getPatternPosition: function(typeNumber) {
    return this.PATTERN_POSITION_TABLE[typeNumber - 1] || [];
  },
  getMask: function(maskPattern, i, j) {
    switch (maskPattern) {
      case 0: return (i + j) % 2 == 0;
      case 1: return i % 2 == 0;
      case 2: return j % 3 == 0;
      case 3: return (i + j) % 3 == 0;
      case 4: return (Math.floor(i / 2) + Math.floor(j / 3)) % 2 == 0;
      case 5: return (i * j) % 2 + (i * j) % 3 == 0;
      case 6: return ((i * j) % 2 + (i * j) % 3) % 2 == 0;
      case 7: return ((i * j) % 3 + (i + j) % 2) % 2 == 0;
      default: throw new Error("bad maskPattern:" + maskPattern);
    }
  },
  getErrorCorrectPolynomial: function(errorCorrectLength) {
    let a = new QRPolynomial([1], 0);
    for (let i = 0; i < errorCorrectLength; i++) {
      a = a.multiply(new QRPolynomial([1, QRMath.gexp(i)], 0));
    }
    return a;
  },
  getLengthInBits: function(mode, type) {
    if (1 <= type && type < 10) {
      return 8;
    } else if (type < 27) {
      return 16;
    } else if (type < 40) {
      return 16;
    } else {
      throw new Error("type:" + type);
    }
  },
  getLostPoint: function(qrModel) {
    const moduleCount = qrModel.getModuleCount();
    let lostPoint = 0;
    for (let row = 0; row < moduleCount; row++) {
      for (let col = 0; col < moduleCount; col++) {
        let sameColorCount = 0;
        const dark = qrModel.isDark(row, col);
        for (let r = -1; r <= 1; r++) {
          if (row + r < 0 || moduleCount <= row + r) continue;
          for (let c = -1; c <= 1; c++) {
            if (col + c < 0 || moduleCount <= col + c) continue;
            if (r == 0 && c == 0) continue;
            if (dark == qrModel.isDark(row + r, col + c)) sameColorCount++;
          }
        }
        if (sameColorCount > 5) lostPoint += (3 + sameColorCount - 5);
      }
    }
    for (let row = 0; row < moduleCount - 1; row++) {
      for (let col = 0; col < moduleCount - 1; col++) {
        const c0 = qrModel.isDark(row, col);
        const c1 = qrModel.isDark(row, col + 1);
        const c2 = qrModel.isDark(row + 1, col);
        const c3 = qrModel.isDark(row + 1, col + 1);
        if (c0 == c1 && c0 == c2 && c0 == c3) lostPoint += 3;
      }
    }
    for (let row = 0; row < moduleCount; row++) {
      for (let col = 0; col < moduleCount - 6; col++) {
        if (qrModel.isDark(row, col) && !qrModel.isDark(row, col + 1) && qrModel.isDark(row, col + 2) && qrModel.isDark(row, col + 3) && qrModel.isDark(row, col + 4) && !qrModel.isDark(row, col + 5) && qrModel.isDark(row, col + 6)) {
          lostPoint += 40;
        }
      }
    }
    for (let col = 0; col < moduleCount; col++) {
      for (let row = 0; row < moduleCount - 6; row++) {
        if (qrModel.isDark(row, col) && !qrModel.isDark(row + 1, col) && qrModel.isDark(row + 2, col) && qrModel.isDark(row + 3, col) && qrModel.isDark(row + 4, col) && !qrModel.isDark(row + 5, col) && qrModel.isDark(row + 6, col)) {
          lostPoint += 40;
        }
      }
    }
    let darkCount = 0;
    for (let col = 0; col < moduleCount; col++) {
      for (let row = 0; row < moduleCount; row++) {
        if (qrModel.isDark(row, col)) darkCount++;
      }
    }
    const ratio = Math.abs(100 * darkCount / moduleCount / moduleCount - 50) / 5;
    lostPoint += ratio * 10;
    return lostPoint;
  }
};

export default QRCodeAlg;
export { QRCodeAlg };
