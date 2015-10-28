angular.module("app", [])

    .controller("ctrl", function($scope, $window) {

        $scope.plan = [
            {
                title: 'I DO ALRIGHT',
                price: 4.99,
                quantity: 3
            },
            {
                title: 'LADIES MAN',
                price: 8.99,
                quantity: 6
            },
            {
                title: 'DON JUAN',
                price: 11.99,
                quantity: 12
            },
            {
                title: 'CLEAN UP HITTER',
                price: 20.99,
                quantity: 24
            }
        ];

        $scope.formData = {
            firstName: '',
            lastName: '',
            email: '',
            addressL1: '',
            addressL2: '',
            city: '',
            province: '',
            country: '',
            cardHolderName: '',
            cardNumber: '',
            cardExpM: '',
            cardExpY: '',
            cardCVV: ''
        };

        $scope.activePlan = 0;

        $scope.selectPlan = function(planId) {
            $scope.activePlan = planId;
            $scope.formPage = 2;
        };

        $scope.selectBrand = function(brand) {
            $scope.activeBrand = brand;
            $scope.formPage = 3;
        };

        $scope.goBack = function(formPage) {
            $scope.formPage = formPage;
        };

        $scope.next = function(formPage) {
            $scope.formPage = formPage;
        };

        $scope.refreshPage = function() {
            $window.location.href = '/';
        };
});