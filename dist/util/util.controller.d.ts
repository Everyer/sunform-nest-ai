import { UtilService } from './util.service';
export declare class UtilController {
    private readonly utilService;
    constructor(utilService: UtilService);
    getLowcodeCode(dto: {
        componentCode: string;
    }): Promise<any>;
    getExampleLowcodeCode(dto: {
        componentCode: string;
    }): Promise<any>;
}
