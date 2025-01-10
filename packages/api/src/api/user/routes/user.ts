export default {
  routes: [
    {
     method: 'PUT',
     path: '/user',
     handler: 'user.update',
     config: {
       policies: [],
       middlewares: [],
     },
    },
  ],
};
