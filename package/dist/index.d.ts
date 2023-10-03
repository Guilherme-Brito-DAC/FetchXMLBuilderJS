declare class orderBy {
    attribute: string;
    descending?: boolean;
}
declare class filter {
    logicalOperator: string;
    innerFilters: filter[];
    conditions: condition[];
}
declare class condition {
    attribute: string;
    operator: string;
    value: string;
}
declare class linkEntity {
    name: string;
    from: string;
    to: string;
    linkType: string;
    alias: string;
    columns: string[];
    filters: filter[];
    orders: orderBy[];
    linkEntitys: linkEntity[];
}
declare class fetchXMLOptions {
    top: number;
    page: number;
    distinct: boolean;
    aggregate: boolean;
}
export default class FetchXmlBuilder {
    private fetchXml;
    private entityName;
    private root;
    constructor(entityName: string, options?: fetchXMLOptions);
    select(columns?: string[], entityName?: string, parentElement?: Element): this;
    filter(filter: filter, parentElement?: Element): this;
    orderBy(orderBy: orderBy, parentElement?: Element): this;
    linkEntity(linkEntity: linkEntity, parentElement?: Element): this;
    build(format?: boolean): string;
    private formatXml;
}
export {};
