"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_COMPONENT_TYPE = exports.COMPONENT_TYPE_OPTIONS = exports.ComponentType = void 0;
var ComponentType;
(function (ComponentType) {
    ComponentType["WEB"] = "web";
    ComponentType["MOBILE"] = "mobile";
})(ComponentType || (exports.ComponentType = ComponentType = {}));
exports.COMPONENT_TYPE_OPTIONS = [
    { label: 'Web端', value: ComponentType.WEB },
    { label: '移动端', value: ComponentType.MOBILE }
];
exports.DEFAULT_COMPONENT_TYPE = ComponentType.WEB;
//# sourceMappingURL=component.constants.js.map