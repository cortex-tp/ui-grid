describe('ui.grid.cortexResizeGrid', function () {
	var gridScope, gridElm, viewportElm, $scope, $compile, recompile, uiGridConstants;

	var data = [
		{ "name": "Ethel Price", "gender": "female", "company": "Enersol" },
		{ "name": "Claudine Neal", "gender": "female", "company": "Sealoud" },
		{ "name": "Beryl Rice", "gender": "female", "company": "Velity" },
		{ "name": "Wilder Gonzales", "gender": "male", "company": "Geekko" }
	];

	beforeEach(module('ui.grid'));
	beforeEach(module('ui.grid.selection'));
	beforeEach(module('ui.grid.cortex'));
	beforeEach(inject(function (_$compile_, $rootScope, _uiGridConstants_) {
		$scope = $rootScope;
		$compile = _$compile_;
		uiGridConstants = _uiGridConstants_;
		$scope.gridOpts = {
			data: data
		};

		recompile = function () {
			gridElm = angular.element('<div style="width: 500px; height: 300px" ui-grid="gridOpts" ui-grid-cortex-resize></div>');
			document.body.appendChild(gridElm[0]);
			$compile(gridElm)($scope);
			$scope.$digest();
			gridScope = gridElm.isolateScope();

			viewportElm = $(gridElm).find('.ui-grid-viewport');
		};
		recompile();
	}));

	afterEach(function () {
		angular.element(gridElm).remove();
		gridElm = null;
	});

	describe('on grid element dimension change', function () {

		it('adjusts the grid viewport size', inject(function ($timeout) {
			var w = $(viewportElm).width();
			var h = $(viewportElm).height();
			$(gridElm).width(600);

			$timeout.flush();

			var newW = $(viewportElm).width();

			expect(newW).toBeGreaterThan(w);
		}));
	});

	// Rebuild the grid as having 100% width and being in a 400px wide container, then change the container width to 500px and make sure it adjusts
	describe('on grid container dimension change', function () {
		var gridContainerElm;

		beforeEach(function () {
			angular.element(gridElm).remove();

			gridContainerElm = angular.element('<div style="width: 400px"><div style="width: 100%; height: 300px" ui-grid="gridOpts" ui-grid-cortex-resize></div></div>');
			document.body.appendChild(gridContainerElm[0]);
			$compile(gridContainerElm)($scope);
			$scope.$digest();

			gridElm = gridContainerElm.find('[ui-grid]');

			viewportElm = $(gridElm).find('.ui-grid-viewport');
		});

		it('adjusts the grid viewport size', inject(function ($timeout) {
			var w = $(viewportElm).width();
			var h = $(viewportElm).height();

			$(gridContainerElm).width(500);

			$timeout.flush();

			var newW = $(viewportElm).width();

			expect(newW).toBeGreaterThan(w);
		}));
	});

});
