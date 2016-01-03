angular.module('locationTracker', ['ui.router', 'geolocation', 'angularMoment']).config(function ($stateProvider, $urlRouterProvider) {

    $stateProvider
        .state('login', {
            url: '/',
            templateUrl: './features/login/loginTmpl.html'
        })

        .state('user', {
            url: '/user/:id',
            templateUrl: './features/user/userTmpl.html',
            controller: 'userCtrl'
        })

        .state('list', {
            url: '/user/:id/list-view',
            templateUrl: './features/list/listViewTmpl.html',
            controller: 'listViewCtrl'
        })

        .state('search', {
            url: '/user/:id/search',
            templateUrl: './features/search/searchTmpl.html',
            controller: 'userCtrl'
        })

        .state('info', {
            url: '/user/:id/info',
            templateUrl: './features/info/infoTmpl.html',
            controller: 'userCtrl'
        })

    $urlRouterProvider
        .otherwise('/');






});