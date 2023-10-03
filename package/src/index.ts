class orderBy {
    public attribute: string
    public descending?: boolean
}

class filter {
    public logicalOperator: string
    public innerFilters: filter[]
    public conditions: condition[]
}

class condition {
    public attribute: string
    public operator: string
    public value: string
}

class linkEntity {
    public name: string
    public from: string
    public to: string
    public linkType: string
    public alias: string
    public columns: string[]
    public filters: filter[]
    public orders: orderBy[]
    public linkEntitys: linkEntity[]
}

class fetchXMLOptions {
    public top: number
    public page: number
    public distinct: boolean
    public aggregate: boolean
}

export default class FetchXmlBuilder {
    private fetchXml: XMLDocument
    private entityName: string
    private root: HTMLElement

    constructor(entityName: string, options?: fetchXMLOptions) {
        this.fetchXml = document.implementation.createDocument(null, "fetch", null)
        this.entityName = entityName
        this.root = this.fetchXml.documentElement
        this.root.setAttribute("version", "1.0")
        this.root.setAttribute("output-format", "xml-platform")
        this.root.setAttribute("mapping", "logical")

        if (typeof options !== 'undefined' && options) {
            if (options.top != null && options.top != undefined && options.top.toString()) {
                this.root.setAttribute("top", options.top.toString())
            }

            if (options.page != null && options.page != undefined && options.page.toString()) {
                this.root.setAttribute("page", options.page.toString())
            }

            if (options.distinct != null && options.distinct != undefined && options.distinct.toString()) {
                this.root.setAttribute("distinct", options.distinct.toString())
            }

            if (options.aggregate != null && options.aggregate != undefined && options.aggregate.toString()) {
                this.root.setAttribute("aggregate", options.aggregate.toString())
            }
        }
    }

    select(columns?: string[], entityName?: string, parentElement?: Element) {
        try {
            let entity = null

            if (!this.root.hasChildNodes()) {
                entity = this.fetchXml.createElement("entity")
                entity.setAttribute("name", this.entityName)
            }
            else {
                entity = this.root.getElementsByTagName("entity")[0]
            }

            if (typeof columns !== 'undefined' && columns && columns.length) {
                columns.forEach((column) => {
                    const attribute = this.fetchXml.createElement("attribute")
                    attribute.setAttribute("name", column)

                    if (typeof entityName !== 'undefined' && entityName) {
                        attribute.setAttribute("entityname", entityName)
                    }

                    if (typeof parentElement !== 'undefined' && parentElement)
                        parentElement.appendChild(attribute)
                    else
                        entity.appendChild(attribute)
                })
            } else {
                const allAttributes = this.fetchXml.createElement("all-attributes")

                if (typeof parentElement !== 'undefined' && parentElement)
                    parentElement.appendChild(allAttributes)
                else
                    entity.appendChild(allAttributes)
            }

            if (parentElement == null || parentElement == undefined) {
                if (!this.root.hasChildNodes()) {
                    this.root.appendChild(entity)
                }
            }

            return this
        } catch (error) {
            console.error(error)
        }
    }

    filter(filter: filter, parentElement?: Element) {
        try {
            let logicalOperator = filter.logicalOperator || "and"

            const filterElement = this.fetchXml.createElement("filter")

            filterElement.setAttribute("type", logicalOperator)

            if (filter.conditions && filter.conditions.length) {
                filter.conditions.forEach((condition) => {
                    const conditionElement = this.fetchXml.createElement("condition")

                    conditionElement.setAttribute("attribute", condition.attribute)
                    conditionElement.setAttribute("operator", condition.operator)

                    if (condition.value != null && condition.value != undefined) {
                        conditionElement.setAttribute("value", condition.value)
                    }

                    filterElement.appendChild(conditionElement)
                })
            }

            if (typeof parentElement !== 'undefined' && parentElement)
                parentElement.appendChild(filterElement)
            else
                this.fetchXml.getElementsByTagName("entity")[0].appendChild(filterElement)

            if (filter.innerFilters) {
                if (Array.isArray(filter.innerFilters)) {
                    filter.innerFilters.forEach((innerFilter) => {
                        this.filter(innerFilter, filterElement)
                    })
                }
                else {
                    this.filter(filter.innerFilters, filterElement)
                }
            }

            return this
        } catch (error) {
            console.error(error)
        }
    }

    orderBy(orderBy: orderBy, parentElement?: Element) {
        try {
            const order = this.fetchXml.createElement("order")

            order.setAttribute("attribute", orderBy.attribute)

            if (typeof orderBy.descending !== 'undefined' && orderBy.descending == true)
                order.setAttribute("descending", "true")
            else
                order.setAttribute("descending", "false")

            if (typeof parentElement !== 'undefined' && parentElement)
                parentElement.appendChild(order)
            else
                this.fetchXml.getElementsByTagName("entity")[0].appendChild(order)

            return this
        } catch (error) {
            console.error(error)
        }
    }

    linkEntity(linkEntity: linkEntity, parentElement?: Element) {
        try {
            const linkEntityElement = this.fetchXml.createElement("link-entity")

            linkEntityElement.setAttribute("name", linkEntity.name)
            linkEntityElement.setAttribute("from", linkEntity.from)
            linkEntityElement.setAttribute("to", linkEntity.to)

            if (linkEntity.linkType)
                linkEntityElement.setAttribute("link-type", linkEntity.linkType)
            else
                linkEntityElement.setAttribute("link-type", "inner")

            if (linkEntity.alias)
                linkEntityElement.setAttribute("alias", linkEntity.alias)

            if (typeof parentElement !== 'undefined' && parentElement)
                parentElement.appendChild(linkEntityElement)
            else
                this.fetchXml.getElementsByTagName("entity")[0].appendChild(linkEntityElement)

            if (linkEntity.columns && linkEntity.columns.length) {
                this.select(linkEntity.columns, linkEntity.alias || linkEntity.name, linkEntityElement)
            }

            if (linkEntity.filters) {
                if (Array.isArray(linkEntity.filters)) {
                    linkEntity.filters.forEach((filter) => {
                        this.filter(filter, linkEntityElement)
                    })
                }
                else {
                    this.filter(linkEntity.filters, linkEntityElement)
                }
            }

            if (linkEntity.orders && linkEntity.orders.length) {
                if (Array.isArray(linkEntity.orders)) {
                    linkEntity.orders.forEach((order) => {
                        this.orderBy(order, linkEntityElement)
                    })
                }
                else {
                    this.filter(linkEntity.orders, linkEntityElement)
                }
            }

            if (linkEntity.linkEntitys && linkEntity.linkEntitys.length) {
                if (Array.isArray(linkEntity.linkEntitys)) {
                    linkEntity.linkEntitys.forEach((innerLinkEntity) => {
                        this.linkEntity(innerLinkEntity, linkEntityElement)
                    })
                }
                else {
                    this.filter(linkEntity.linkEntitys, linkEntityElement)
                }
            }

            return this
        } catch (error) {
            console.error(error)
        }
    }

    build(format?: boolean) {
        try {
            const serializer = new XMLSerializer()

            let result = serializer.serializeToString(this.fetchXml)

            if (typeof format !== 'undefined' && format == true)
                return this.formatXml(result)
            else
                return result
        } catch (error) {
            console.error(error)
        }
    }

    private formatXml(xml): string {
        try {
            let formatted = '', indent = ''
            let tab = '\t'

            xml.split(/>\s*</).forEach(function (node) {
                if (node.match(/^\/\w/)) indent = indent.substring(tab.length)

                formatted += indent + '<' + node + '>\r\n'

                if (node.match(/^<?\w[^>]*[^\/]$/)) indent += tab
            })

            return formatted.substring(1, formatted.length - 3)
        } catch (error) {
            console.error(error)
            return xml
        }
    }
}