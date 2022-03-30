/// ANGULAR
import { Injectable } from "@angular/core";
import { NgForm } from "@angular/forms";
import * as moment from "moment";
/// Stores
import { BehaviorSubject, finalize, first } from "rxjs";
import { clone } from "lodash";
import { Entity, EntityToType, Farmulor, FarmConfig } from "../types";
import { buildFarm } from "../farm/farm-builder";

export const cleanEmpties = (object: any) => {
  Object.entries(object).forEach(([key, value]) => {
    if (value && typeof value === "object" && !moment.isMoment(value)) {
      cleanEmpties(value);
    }
    if (
      (value &&
        typeof value === "object" &&
        !Object.keys(value).length) ||
      value === null ||
      value === undefined
    ) {
      if (Array.isArray(object)) {
        object.splice(Number(key), 1);
      } else {
        delete object[key];
      }
    }
  });
  return object;
};

/**
 * @description
 * Classe de fabrication d'objets Angular Form.
 **/
@Injectable({
  providedIn: "root"
})
export class NgxFarmulorService {
  /**
   * @description
   * Méthode de fabrication d'objets Angular Form.
   **/
  public build<E extends Entity>(
    entity: E,
    config: FarmConfig<EntityToType<E>> = {}
  ): Farmulor<E> {
    const formGroup = buildFarm(entity as any);
    const store = new BehaviorSubject<EntityToType<E>>(
      config.defaultValue || ({} as any)
    );
    const storeSubscription = store.subscribe(value =>
      formGroup.patchValue(cleanEmpties(value))
    );
    const {
      initialIsEdit = false,
      saveAction,
      getLoadParams,
      loadAction,
      afterSave,
      afterLoad,
      getMessageSuccess,
      hideMessageSuccess,
      ngForm
    } = config;
    const destroy = () => {
      storeSubscription.unsubscribe();
    };
    const oSubmitted = new BehaviorSubject(false);
    const form = {
      formGroup,
      ngForm,
      destroy,
      isEdit: initialIsEdit,
      isLoading: false,
      isSaving: false,
      oIsLoading: new BehaviorSubject<boolean>(false),
      getMessageSuccess,
      afterLoad,
      afterSave,
      store,
      save: function (): void {
        oSubmitted.next(true);
        if (this.isLoading) {
          console.info('En cours de sauvegarde, veuillez patienter');
        } else if (!this.formGroup.valid) {
          console.error('Veuillez vérifier votre saisie');
        } else {
          this.isLoading = true;
          this.isSaving = true;
          this.oIsLoading.next(true);
          const clonedForm = clone(formGroup.value);
          cleanEmpties(clonedForm);
          if (saveAction) {
            saveAction(clonedForm)
              .toPromise()
              .then((data: any) => {
                this.isEdit = false;
                let message = "Sauvegarde effectuée";
                if (this.getMessageSuccess) {
                  message = this.getMessageSuccess(data);
                }
                if (!hideMessageSuccess) {
                  console.info(message);
                }

                if (typeof data == typeof clonedForm) {
                  store.next(data);
                }
                if (this.afterSave) {
                  this.afterSave(data);
                }
              })
              .finally(() => {
                this.isLoading = false;
                this.isSaving = false;
                this.oIsLoading.next(false);
              });
          }
        }
      },
      load: function () {
        if (getLoadParams && loadAction) {
          this.isLoading = true;
          this.oIsLoading.next(true);
          const loadParams = getLoadParams();
          if (loadParams) {
            loadAction(loadParams)
              .pipe(first(), finalize(() => {
                this.isLoading = false;
                this.oIsLoading.next(false);
              }))
              .subscribe(data => {
                store.next(data);
                if (this.afterLoad) {
                  this.afterLoad(data);
                }
              });
          }
        }
      },
      cancel: function () {
        this.isEdit = false;
        formGroup.patchValue(cleanEmpties(store.value));
      },
      setNgForm: function (newNgForm: NgForm) {
        form.ngForm = newNgForm;
      },
      oSubmitted: oSubmitted.asObservable()
    };
    return form as any;
  }
}
