import { FormGroupDirective, NgForm } from "@angular/forms";
import { BehaviorSubject, Observable, Subject } from "rxjs";
import { FarmGroup } from "./farm-abstract-control";
import { Entity, EntityToType } from "./types";

/**
 * @description
 * Objet de configuration pour l'initialisation d'un AngularForm
 **/
export interface FarmConfig<E = any> {
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
export interface Farm<E extends Entity = any> {
    store: BehaviorSubject<EntityToType<E>>;
    formGroup: FarmGroup<E>;
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

export interface ApiError {
    timestamp: string;
    message: string;
    fieldName: string;
}
