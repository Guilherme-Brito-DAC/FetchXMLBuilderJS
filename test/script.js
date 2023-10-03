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

//<fetch version="1.0" output-format="xml-platform" mapping="logical" top="50" page="1" distinct="true" aggregate="false">
//	<entity name="account">
//		<attribute name="accountid"/>
//		<attribute name="name"/>
//		<attribute name="createdon"/>
//		<filter type="and">
//			<condition attribute="createdon" operator="yesterday"/>
//			<filter type="or">
//				<condition attribute="name" operator="eq" value="Jeff"/>
//				<condition attribute="name" operator="eq" value="Ryan"/>
//			</filter>
//		</filter>
//		<order attribute="createdon" descending="true"/>
//		<order attribute="name" descending="false"/>
//		<link-entity name="systemuser" from="undefined" to="owninguser" link-type="inner" alias="user">
//			<attribute name="createdon" entityname="user"/>
//			<attribute name="name" entityname="user"/>
//			<filter type="and">
//				<condition attribute="lastname" operator="ne" value="William"/>
//			</filter>
//			<order attribute="createdon" descending="false"/>
//		</link-entity>
//	</entity>
//</fetch>