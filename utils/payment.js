const sdk = require('api')('@cashfreedocs-new/v3#173cym2vlivg07d0');

const paymentModule = ()=>{
    return async(req,res)=>{
    sdk.createPaymentLink({
    customer_details: {
        customer_phone: user.userphoneNumber,
        customer_email: user.userMail,
        customer_name: user.userName
    },
    link_notify: { send_sms: true, send_email: true },
    link_meta: {
        notify_url: 'https://ee08e626ecd88c61c85f5c69c0418cb5.m.pipedream.net',
        return_url: `https://localhost:5173/success-payment/${uniqueId}`
    },
    link_id: uniqueId,
    link_amount: 100,
    link_currency: 'INR',
    link_purpose: 'EB INSURANCE',
    link_partial_payments: false
}, {
    'x-client-id': 'TEST37145524171bbd3d6eebbeac1b554173',
    'x-client-secret': 'TEST1a4794976ca903fb0daf9c4a18ee1d8f8d76b8da',
    'x-api-version': '2022-09-01'
}).then(({ data }) => res.status(200).json({ status: "success", data }));
}
}

module.exports = {paymentModule}