export declare class ConfigCreateDto {
    readonly baseUrl?: string;
    readonly tokenKey?: string;
    readonly tokenValue?: string;
    readonly host?: string;
}
export declare class ConfigUpdateDto extends ConfigCreateDto {
    readonly id?: string;
}
