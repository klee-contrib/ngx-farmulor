import { FormGroupDirective, NgForm } from "@angular/forms";
import { BehaviorSubject, Observable, Subject } from "rxjs";
import { Entity, EntityToType } from ".";
import { FarmGroup } from "../farm/farm-abstract-control";

/**
 * @description
 * Objet de configuration pour l'initialisation d'un AngularForm
 **/
export interface FarmConfig<E> {
  saveAction?: (data: E) => Observable<E> | any;
  loadAction?: (...ards: any[]) => Observable<E>;
  getLoadParams?: () => any[] | undefined;
  initialIsEdit?: boolean;
  afterSave?: (data: E) => void;
  afterLoad?: (data: E) => void;
  defaultValue?: E;
  ngForm?: NgForm;
  getMessageSuccess?: (data: E) => string;
  hideMessageSuccess?: boolean;
}

/**
 * @description
 * Surcouche au formulaire Angular contenant des méta données de formulaires
 **/
export interface Farmulor<E extends Entity = any> {
  store: BehaviorSubject<EntityToType<E>>;
  farmGroup: FarmGroup<E>;
  destroy: Function;
  isEdit?: boolean;
  isLoading?: boolean;
  isSaving?: boolean;
  save: Function;
  afterSave: Function;
  load: Function;
  cancel: Function;
  ngForm: NgForm | FormGroupDirective;
  setNgForm: Function;
  oIsLoading: Subject<boolean>;
  oSubmitted: Observable<boolean>;
}
