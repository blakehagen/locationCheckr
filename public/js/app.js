angular.module('locationTracker', ['ui.router']).config(function ($stateProvider, $urlRouterProvider) {

    $stateProvider
        .state('login', {
            url: '/',
            templateUrl: './features/login/loginTmpl.html',
            controller: 'userCtrl'
        })

        .state('user', {
            url: '/user/:id',
            templateUrl: './features/user/userTmpl.html',
            controller: 'userCtrl'
        })

    $urlRouterProvider
        .otherwise('/');






});