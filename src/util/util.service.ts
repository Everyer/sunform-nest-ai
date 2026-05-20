import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { BusinessException } from '../common/exceptions/business.exception';
@Injectable()
export class UtilService {
    async getLowcodeCode(componentCode: string) {
        try {
            const response = await axios.post("http://sunform.tech/lowcode/components/getConfigByOtherProject", {
                componentCode,
                projectId: "b6bb5682-f794-44c1-b59d-bb1ed34792a0"
            });
            if(response.data.success){
                return response.data.data;
            }else{
                throw new BusinessException(response.data.message);
            }
        } catch (error) {
            throw new BusinessException('获取组件配置失败');
        }
    }
    async getExampleLowcodeCode(componentCode: string) {
        try {
            const response = await axios.post("http://sunform.tech/lowcode/components/getConfigByOtherProject", {
                componentCode,
                projectId: "39043ba1-8c0a-4895-9531-4284c81b188c"
            });
            if(response.data.success){
                return response.data.data;
            }else{
                throw new BusinessException(response.data.message);
            }
        } catch (error) {
            throw new BusinessException('获取组件配置失败');
        }
    }
}
