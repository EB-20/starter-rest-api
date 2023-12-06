const rolePermissions = [{
    role:"SADMIN",
    permissions:['add-Org','add-EMP' , 'delete-EMP' , 'update-EMP' , 'view-EMP',
    'add-ADMIN' , 'delete-ADMIN' , 'update-ADMIN' , 'view-ADMIN',
    'add-HR' , 'delete-HR' , 'update-HR' , 'view-HR','view-Roles','view-PLAN',
    'view-PLANPRICEORG','update-PLAN','add-ROLES','set-ROLES','view-allUserData',
    'view-KEY','SADMIN']
},
{
    role:"ADMIN",
    permissions:['add-Org','add-EMP' , 'delete-EMP' , 'update-EMP' , 'view-EMP',
                'add-HR' , 'delete-HR' , 'update-HR' , 'view-HR','view-PLAN',
                'view-PLANPRICEORG','add-ROLES','set-ROLES','view-allUserData']
},
{
    role:"HR",
    permissions:['add-EMP' , 'delete-EMP' , 'update-EMP' , 'view-EMP']

},
{
    role:"EMP",
    permissions:['view-EMP'] 
}]
const permissions = [{
    permissions:['add-Org','add-EMP' , 'delete-EMP' , 'update-EMP' , 'view-EMP',
    'add-ADMIN' , 'delete-ADMIN' , 'update-ADMIN' , 'view-ADMIN',
    'add-HR' , 'delete-HR' , 'update-HR' , 'view-HR','view-Roles','view-PLAN',
    'view-PLANPRICEORG','update-PLAN','add-ROLES','set-ROLES','view-allUserData','view-KEY','SADMIN'],
    pagePermissions:['admin-page' ,'emp-page','sadmin-page' ]
}]
const ebixSadmin = [{
    phoneNoVerified:true,
    userName:"SADMIN",
    userphoneNumber:"9999999999",
    role:"SADMIN",
    userMail:"bse@gmail.com",
    superAdminUniversalAccess:true
}]
const defaultLoginUser = [{
    phoneNoVerified:true,
    userName:"ADMIN",
    userphoneNumber:"9211906242",   
    role:"ADMIN",
    userMail:"test@gmail.com",
    userJourneyStatus:"DONE",
    orgId:"64b127b3fd7eb0e88f0d5ac4",
    phoneOtp:"123456"
}]
const defaultLoginOrg = [{
    orgName:"EBI3Xs"   ,
    planId:"ICIC100" ,
    totalEmployee:100 ,
    companyGstNumber: "75765d38ss",
    partOfSEZ:true  ,
    addressLine1:"2323" ,
    addressLine2: "ugu" ,
    city: "Faridabad",
    state: "HARYANA",
    pincode:"121003" ,
    empAgeCount: 1212,
    totalPlanPrice:168600 ,
    regStatus:"ACTIVE"
}] 
const nomineeRelation = [
    {id:'1',name:"Spouse"},{id:'2',name:"Brother"},{id:'3',name:"Child"},{id:'4',name:"Daughter"},{id:'5',name:"Employee"},{id:'6',name:"Father"},
    {id:'7',name:"Father in law"},{id:'8',name:"Grand Daughter"},{id:'9',name:"Grand Father"},{id:'10',name:"Grand Mother"},
    {id:'11',name:"Grand Son"},{id:'12',name:"Husband"},{id:'13',name:"Mother"},{id:'14',name:"Mother in law"},{id:'15',name:"Partner"},
    {id:'16',name:"Policy Holder"},{id:'17',name:"Sister"},{id:'18',name:"Son"},{id:'19',name:"Special concession adult"},
    {id:'20',name:"Special concession child"},{id:'21',name:"Wife"},{id:'22',name:"Setting"}   
]

module.exports = {rolePermissions,permissions,ebixSadmin,defaultLoginOrg,defaultLoginUser,nomineeRelation}