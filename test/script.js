import FetchXmlBuilder from '../package/dist/index.js'

let fetch = new FetchXmlBuilder("account", {
    distinct: true,
    aggregate: false,
    page: 1,
    top: 50,
})

// ATTRIBUTES

fetch = fetch.select(["accountid", "name"])
fetch = fetch.select(["createdon"])                     // will not replace the top speakers

// FILTERS

fetch.filter({
    conditions: [
        {
            attribute: 'createdon',
            operator: 'yesterday',
        }
    ],
    innerFilters: [{                                    // Can be a array and also a object, support multiple inner filters
        logicalOperator: 'or',
        conditions: [
            {
                attribute: 'name',
                operator: 'eq',
                value: 'Jeff'
            },
            {
                attribute: 'name',
                operator: 'eq',
                value: 'Ryan'
            },
        ]
    }]
})

// ORDERS BY

fetch.orderBy({
    descending: true,
    attribute: 'createdon'
})

fetch.orderBy({
    descending: false,
    attribute: 'name'
})

// LINK ENTITY

fetch.linkEntity({
    name: 'systemuser',
    to: 'owninguser',
    linkType: 'inner',
    alias: 'user',
    columns: [
        'createdon',
        'name'
    ],
    filters: [
        {
            logicalOperator: "and",
            conditions: [
                {
                    attribute: 'lastname',
                    operator: 'ne',
                    value: "William"
                }
            ]
        }
    ],
    orders: [
        {
            attribute: 'createdon'
        }
    ]
})

let result = fetch.build(true) // true is for format the result string