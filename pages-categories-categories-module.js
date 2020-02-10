(window["webpackJsonp"] = window["webpackJsonp"] || []).push([["pages-categories-categories-module"],{

/***/ "./src/app/pages/categories/categories-routing.module.ts":
/*!***************************************************************!*\
  !*** ./src/app/pages/categories/categories-routing.module.ts ***!
  \***************************************************************/
/*! exports provided: CategoriesRoutingModule */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "CategoriesRoutingModule", function() { return CategoriesRoutingModule; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/router */ "./node_modules/@angular/router/fesm5/router.js");
/* harmony import */ var _category_list_category_list_component__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./category-list/category-list.component */ "./src/app/pages/categories/category-list/category-list.component.ts");
/* harmony import */ var _category_form_category_form_component__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./category-form/category-form.component */ "./src/app/pages/categories/category-form/category-form.component.ts");





var routes = [
    { path: '', component: _category_list_category_list_component__WEBPACK_IMPORTED_MODULE_3__["CategoryListComponent"] },
    { path: 'new', component: _category_form_category_form_component__WEBPACK_IMPORTED_MODULE_4__["CategoryFormComponent"] },
    { path: ':id/edit', component: _category_form_category_form_component__WEBPACK_IMPORTED_MODULE_4__["CategoryFormComponent"] }
];
var CategoriesRoutingModule = /** @class */ (function () {
    function CategoriesRoutingModule() {
    }
    CategoriesRoutingModule = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["NgModule"])({
            imports: [_angular_router__WEBPACK_IMPORTED_MODULE_2__["RouterModule"].forChild(routes)],
            exports: [_angular_router__WEBPACK_IMPORTED_MODULE_2__["RouterModule"]]
        })
    ], CategoriesRoutingModule);
    return CategoriesRoutingModule;
}());



/***/ }),

/***/ "./src/app/pages/categories/categories.module.ts":
/*!*******************************************************!*\
  !*** ./src/app/pages/categories/categories.module.ts ***!
  \*******************************************************/
/*! exports provided: CategoriesModule */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "CategoriesModule", function() { return CategoriesModule; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _shared_shared_module__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../shared/shared.module */ "./src/app/shared/shared.module.ts");
/* harmony import */ var _categories_routing_module__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./categories-routing.module */ "./src/app/pages/categories/categories-routing.module.ts");
/* harmony import */ var _category_list_category_list_component__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./category-list/category-list.component */ "./src/app/pages/categories/category-list/category-list.component.ts");
/* harmony import */ var _category_form_category_form_component__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./category-form/category-form.component */ "./src/app/pages/categories/category-form/category-form.component.ts");






var CategoriesModule = /** @class */ (function () {
    function CategoriesModule() {
    }
    CategoriesModule = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["NgModule"])({
            imports: [
                _shared_shared_module__WEBPACK_IMPORTED_MODULE_2__["SharedModule"],
                _categories_routing_module__WEBPACK_IMPORTED_MODULE_3__["CategoriesRoutingModule"]
            ],
            declarations: [_category_list_category_list_component__WEBPACK_IMPORTED_MODULE_4__["CategoryListComponent"], _category_form_category_form_component__WEBPACK_IMPORTED_MODULE_5__["CategoryFormComponent"]]
        })
    ], CategoriesModule);
    return CategoriesModule;
}());



/***/ }),

/***/ "./src/app/pages/categories/category-form/category-form.component.css":
/*!****************************************************************************!*\
  !*** ./src/app/pages/categories/category-form/category-form.component.css ***!
  \****************************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJzcmMvYXBwL3BhZ2VzL2NhdGVnb3JpZXMvY2F0ZWdvcnktZm9ybS9jYXRlZ29yeS1mb3JtLmNvbXBvbmVudC5jc3MifQ== */"

/***/ }),

/***/ "./src/app/pages/categories/category-form/category-form.component.html":
/*!*****************************************************************************!*\
  !*** ./src/app/pages/categories/category-form/category-form.component.html ***!
  \*****************************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<app-bread-crumb\n  [items]=\"[{text: 'Categorias', link: '/categories'}, {text: pageTitle}]\"\n></app-bread-crumb>\n\n<app-page-header\n  [page-title]=\"pageTitle\"\n  button-text=\"<< Voltar\"\n  button-link=\"/categories\"\n  button-class=\"btn-light\"\n></app-page-header>\n\n\n<form [formGroup]=\"resourceForm\" (submit)=\"submitForm()\">\n\n  <div class=\"card\">\n    <div class=\"card-header\">\n      Informações sobre a categoria\n    </div>\n\n    <div class=\"card-body\">\n      <div class=\"form-row\">\n        <div class=\"form-group col-md-4\">\n          <label for=\"name\">Nome</label>\n          <input type=\"text\" class=\"form-control\" id=\"name\" formControlName=\"name\">\n\n          <app-form-field-error [form-control]=\"resourceForm.get('name')\"></app-form-field-error>\n        </div>\n\n        <div class=\"form-group col-md-8\">\n          <label for=\"description\">Descrição</label>\n          <input type=\"text\" class=\"form-control\" id=\"description\" formControlName=\"description\">\n        </div>\n      </div>\n    </div>\n  </div>\n\n  <app-server-error-messages [server-error-messages]=\"serverErrorMessages\"></app-server-error-messages>\n\n  <button [disabled]=\"submittingForm || resourceForm.invalid\" type=\"submit\" class=\"btn btn-primary btn-lg float-right mt-3\">\n    Salvar\n  </button>\n\n</form>"

/***/ }),

/***/ "./src/app/pages/categories/category-form/category-form.component.ts":
/*!***************************************************************************!*\
  !*** ./src/app/pages/categories/category-form/category-form.component.ts ***!
  \***************************************************************************/
/*! exports provided: CategoryFormComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "CategoryFormComponent", function() { return CategoryFormComponent; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/forms */ "./node_modules/@angular/forms/fesm5/forms.js");
/* harmony import */ var _shared_components_base_resource_form_base_resource_form_component__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../shared/components/base-resource-form/base-resource-form.component */ "./src/app/shared/components/base-resource-form/base-resource-form.component.ts");
/* harmony import */ var _shared_category_model__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../shared/category.model */ "./src/app/pages/categories/shared/category.model.ts");
/* harmony import */ var _shared_category_service__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../shared/category.service */ "./src/app/pages/categories/shared/category.service.ts");






var CategoryFormComponent = /** @class */ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_0__["__extends"](CategoryFormComponent, _super);
    function CategoryFormComponent(categoryService, injector) {
        var _this = _super.call(this, injector, new _shared_category_model__WEBPACK_IMPORTED_MODULE_4__["Category"](), categoryService, _shared_category_model__WEBPACK_IMPORTED_MODULE_4__["Category"].fromJson) || this;
        _this.categoryService = categoryService;
        _this.injector = injector;
        return _this;
    }
    CategoryFormComponent.prototype.buildResourceForm = function () {
        this.resourceForm = this.formBuilder.group({
            id: [null],
            name: [null, [_angular_forms__WEBPACK_IMPORTED_MODULE_2__["Validators"].required, _angular_forms__WEBPACK_IMPORTED_MODULE_2__["Validators"].minLength(2)]],
            description: [null]
        });
    };
    CategoryFormComponent.prototype.creationPageTitle = function () {
        return "Cadastro de Nova Categoria";
    };
    CategoryFormComponent.prototype.editionPageTitle = function () {
        var categoryName = this.resource.name || "";
        return "Editando Categoria: " + categoryName;
    };
    CategoryFormComponent = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Component"])({
            selector: 'app-category-form',
            template: __webpack_require__(/*! ./category-form.component.html */ "./src/app/pages/categories/category-form/category-form.component.html"),
            styles: [__webpack_require__(/*! ./category-form.component.css */ "./src/app/pages/categories/category-form/category-form.component.css")]
        }),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:paramtypes", [_shared_category_service__WEBPACK_IMPORTED_MODULE_5__["CategoryService"], _angular_core__WEBPACK_IMPORTED_MODULE_1__["Injector"]])
    ], CategoryFormComponent);
    return CategoryFormComponent;
}(_shared_components_base_resource_form_base_resource_form_component__WEBPACK_IMPORTED_MODULE_3__["BaseResourceFormComponent"]));



/***/ }),

/***/ "./src/app/pages/categories/category-list/category-list.component.css":
/*!****************************************************************************!*\
  !*** ./src/app/pages/categories/category-list/category-list.component.css ***!
  \****************************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJzcmMvYXBwL3BhZ2VzL2NhdGVnb3JpZXMvY2F0ZWdvcnktbGlzdC9jYXRlZ29yeS1saXN0LmNvbXBvbmVudC5jc3MifQ== */"

/***/ }),

/***/ "./src/app/pages/categories/category-list/category-list.component.html":
/*!*****************************************************************************!*\
  !*** ./src/app/pages/categories/category-list/category-list.component.html ***!
  \*****************************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<app-bread-crumb\n  [items]=\"[{text: 'Categorias'}]\"\n></app-bread-crumb>\n\n<app-page-header\n  page-title=\"Categorias\"\n  button-text=\"+ Nova Categoria\"\n  button-link=\"new\"\n  button-class=\"btn-success\"\n></app-page-header>\n\n\n<table class=\"table table-hover\">\n  <thead>\n    <tr class=\"bg-primary text-light\">\n      <th>Categoria</th>\n      <th>Ações</th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr *ngFor=\"let category of resources\">\n      <td>\n        <strong>{{category.name}}</strong><br>\n        <small>{{category.description}}</small>\n      </td>\n      <td>\n        <a [routerLink]=\"[category.id, 'edit']\" class=\"btn btn-outline-info btn-sm mr-2\">Editar</a>\n        <button (click)=\"deleteResource(category)\" class=\"btn btn-outline-danger btn-sm\">Excluir</button>\n      </td>\n    </tr>\n  </tbody>\n</table>\n"

/***/ }),

/***/ "./src/app/pages/categories/category-list/category-list.component.ts":
/*!***************************************************************************!*\
  !*** ./src/app/pages/categories/category-list/category-list.component.ts ***!
  \***************************************************************************/
/*! exports provided: CategoryListComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "CategoryListComponent", function() { return CategoryListComponent; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _shared_components_base_resource_list_base_resource_list_component__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../shared/components/base-resource-list/base-resource-list.component */ "./src/app/shared/components/base-resource-list/base-resource-list.component.ts");
/* harmony import */ var _shared_category_service__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../shared/category.service */ "./src/app/pages/categories/shared/category.service.ts");




var CategoryListComponent = /** @class */ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_0__["__extends"](CategoryListComponent, _super);
    function CategoryListComponent(categoryService) {
        var _this = _super.call(this, categoryService) || this;
        _this.categoryService = categoryService;
        return _this;
    }
    CategoryListComponent = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Component"])({
            selector: 'app-category-list',
            template: __webpack_require__(/*! ./category-list.component.html */ "./src/app/pages/categories/category-list/category-list.component.html"),
            styles: [__webpack_require__(/*! ./category-list.component.css */ "./src/app/pages/categories/category-list/category-list.component.css")]
        }),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:paramtypes", [_shared_category_service__WEBPACK_IMPORTED_MODULE_3__["CategoryService"]])
    ], CategoryListComponent);
    return CategoryListComponent;
}(_shared_components_base_resource_list_base_resource_list_component__WEBPACK_IMPORTED_MODULE_2__["BaseResourceListComponent"]));



/***/ })

}]);
//# sourceMappingURL=pages-categories-categories-module.js.map