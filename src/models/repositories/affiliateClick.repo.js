'use strict'

const AFFILIATE_CLICK = require('../affliliateClick.model')

const recordClick = async({ affiliate_link, ip_address, user_agent, country, device_type, browser }) => {
    return await AFFILIATE_CLICK.create({
        affiliate_link,
        ip_address,
        user_agent,
        country,
        device_type,
        browser
    })
}

module.exports = {
    recordClick
}