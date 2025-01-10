export default {
  routes: [
    {
     method: 'POST',
     path: '/bank/connect',
     handler: 'bank.connectInit',
     config: {
       policies: [], // TODO: Authorized user policy
       middlewares: [],
     },
    },
    {
     method: 'GET',
     path: '/bank/connect/confirm',
     handler: 'bank.connectConfirm',
     config: {
       policies: [], // TODO: Authorized user policy
       middlewares: [],
     },
    }
  ],
};
