import {
  FormControl,
  FormArray,
  FormGroup,
  AbstractControl,
  AbstractControlOptions,
  ValidatorFn
} from "@angular/forms";
import {
  Entity,
  ObjectEntry,
  ListEntry,
} from "./types";
import { isArray, forEach, dropRight, isNumber, isNil } from "lodash";
import { EntityToType, FarmDomain, FieldEntry, PrimitiveListEntry, PrimitiveListFieldEntry, RecursiveListEntry } from "./types/entity";

/**
 * @description Surcharge des FormGroup Angular, permettant de les typer et d'y ajouter des propriétés customs
 */
export class FarmControl<E extends FieldEntry> extends FormControl {
  domain: FarmDomain;
  isRequired: boolean;
  label?: string;
  entity: E;

  constructor(
    e: E,
    value?: typeof e.fieldType,
    validatorOrOpts?:
      | ValidatorFn
      | ValidatorFn[]
      | AbstractControlOptions
      | null
  ) {
    super(value, validatorOrOpts);
    this.domain = e.domain;
    this.isRequired = e.isRequired;
    this.entity = e;
  }
  override patchValue(value: any, options?: object) {
    if (this.value !== value) {
      super.patchValue(value, options);
    }
  }
}

/**
 * @description Surcharge des FormArray Angular, permettant de les typer et d'y ajouter des propriétés customs
 */
export class FarmArray<E extends Entity> extends FormArray {
  entity: E;

  constructor(e: E, value: EntityToType<E>[] | undefined) {
    const abstractControlArray: AbstractControl[] = [];
    if (value) {
      forEach(value, item => {
        abstractControlArray.push(buildForm(e, item));
      });
    }
    super(abstractControlArray);
    this.entity = e;
  }

  /**
   * @description Ajoute une entrée à la liste. Cette entrée est bien un FarmGroup, FarmArray ou FarmControl, correctement typé
   */
  addEntry(
    value?: any,
    index?: number,
    options?: {
      onlySelf?: boolean;
      emitEvent?: boolean;
    }
  ) {
    const result = buildForm(this.entity, value);
    result.setParent(this);
    if (!isNil(index) && isNumber(index)) {
      this.insert(index, result);
      this.updateValueAndValidity(options);
    } else {
      this.push(result);
    }
    return result;
  }
  override reset(
    values?: EntityToType<E>[],
    options?: {
      onlySelf?: boolean;
      emitEvent?: boolean;
    }
  ) {
    if (values && values.length > 0) {
      super.reset(undefined, { emitEvent: false, onlySelf: true });
      this.patchValue(values, options);
    } else super.reset(options);
  }
  override patchValue(
    values: EntityToType<E>[],
    options?: {
      onlySelf?: boolean;
      emitEvent?: boolean;
    }
  ) {
    if (this.controls.length >= values.length) {
      this.controls = dropRight(
        this.controls,
        this.controls.length - values.length
      );
    }
    forEach(values, (value, index) => {
      if (!this.controls[index]) {
        const newControl = buildForm(this.entity, value);
        newControl.setParent(this);
        this.controls[index] = newControl;
      }
    });
    super.patchValue(values, options);
  }
  override setValue(
    values: EntityToType<E>[],
    options?: {
      onlySelf?: boolean;
      emitEvent?: boolean;
    }
  ) {
    if (this.controls.length >= values.length) {
      this.controls = dropRight(
        this.controls,
        this.controls.length - values.length
      );
    }
    forEach(values, (value, index) => {
      if (!this.controls[index]) {
        const newControl = buildForm(this.entity, value);
        newControl.setParent(this);
        this.controls[index] = newControl;
      }
    });
    super.setValue(values, options);
  }
}

/**
 * @description Surcharge des FormArray Angular, permettant de les typer et d'y ajouter des propriétés customs. Cette classe est utilisée pour décrire les listes de types primitifs (int, string, ...)
 */
export class FarmPrimitiveFormArray<E extends FieldEntry> extends FormArray {
  domain?: FarmDomain;
  isRequired: boolean = false;
  label?: string;
  entity: E;

  constructor(entity: E, value: E[] | undefined) {
    super(value?.map(item=>new FarmControl(entity, item)) || []);
    this.entity = entity;
  }

  /**
   * @description Ajoute une entrée à la liste. Cette entrée est bien un FarmControl, correctement typé
   */
  addEntry(
    value?: E["fieldType"],
    options?: {
      onlySelf?: boolean;
      emitEvent?: boolean;
    }
  ) {
    const result = new FarmControl(this.entity, value);
    this.push(result);
    return result;
  }
  override reset(
    values?: E["fieldType"][],
    options?: {
      onlySelf?: boolean;
      emitEvent?: boolean;
    }
  ) {
    if (values && values.length > 0) {
      super.reset(undefined, { emitEvent: false, onlySelf: true });
      this.patchValue(values);
    } else super.reset(options);
  }
  override patchValue(
    values: E["fieldType"][],
    options?: {
      onlySelf?: boolean;
      emitEvent?: boolean;
    }
  ) {
    if (this.controls.length >= values.length) {
      this.controls = dropRight(
        this.controls,
        this.controls.length - values.length
      );
    }
    forEach(values, (value, index) => {
      if (!this.controls[index]) {
        const controlToPush = new FarmControl(this.entity, value);
        controlToPush.setParent(this);
        this.controls.push(controlToPush);
      }
    });
    super.patchValue(values, options);
  }
  override setValue(
    values: E["fieldType"][],
    options?: {
      onlySelf?: boolean;
      emitEvent?: boolean;
    }
  ) {
    if (!isArray(values)) {
      values = [values];
    }
    if (this.controls.length >= values.length) {
      this.controls = dropRight(
        this.controls,
        this.controls.length - values.length
      );
    }
    forEach(values, (value, index) => {
      if (!this.controls[index]) {
        const controlToPush = new FarmControl(this.entity, value);
        controlToPush.setParent(this);
        this.controls.push(controlToPush);
      }
    });
    super.setValue(values, options);
  }
}

/**
 * @description Décrit le type FarmGroup générique, surcharge des FormGroup de Angular. Permet d'ajouter les propriétés de l'entité, et d'y accéder directement (sans utiliser le get()).
 * */
export type FarmGroup<E extends Entity> = FormGroup &
  {
    -readonly [P in keyof E]: E[P] extends PrimitiveListFieldEntry
    ? FarmPrimitiveFormArray<E[P]>
    : E[P] extends FieldEntry
    ? FarmControl<E[P]>
    : E[P] extends ObjectEntry<infer OE>
    ? FarmGroup<OE>
    : E[P] extends ListEntry<infer LE>
    ? FarmArray<LE>
    : E[P] extends RecursiveListEntry
    ? FarmArray<E>
    : never;
  };

/**
 * Construit un noeud à partir d'une entité, potentiellement de façon récursive.
 * @param entity L'entité de base (dans une liste pour un noeud liste).
 */
export function buildForm<E extends Entity>(
  entity: E,
  value?: any
): FarmGroup<E>;
export function buildForm<E extends Entity>(
  entity: E[],
  value?: any
): FarmArray<E>;
export function buildForm<E extends Entity>(
  entity: E | E[],
  value?: any
): FarmGroup<E> | FarmArray<E> {
  // Cas d'un noeud de type liste : on construit une liste observable à laquelle on greffe les métadonnées et la fonction `set`.
  if (isArray(entity)) {
    const outputEntry = new FarmArray(entity[0], value);
    return outputEntry;
  }
  // Cas d'un noeud simple : On parcourt tous les champs de l'entité.

  const formMap: any = {};
  forEach(
    entity,
    (
      field:
        | FieldEntry
        | ObjectEntry
        | ListEntry
        | RecursiveListEntry
        | PrimitiveListEntry,
      key: keyof E
    ) => {
      let abstractControl;
      switch (field.type) {
        case "list":
          abstractControl = buildForm(
            [field.entity],
            value && value[key]
          );
          break;
        case "recursive-list":
          abstractControl = new FarmArray(
            entity,
            value && value[key]
          );
          break;
        case "object":
          abstractControl = buildForm(
            field.entity,
            value && value[key]
          );
          break;
        case "primitive-list":
          abstractControl = new FarmPrimitiveFormArray(
            field as PrimitiveListFieldEntry,
            value && value[key]
          );
          break;
        default:
          abstractControl = new FarmControl(
            field,
            value && value[key]
          );
      }
      formMap[key] = abstractControl;
    }
  );
  // Ajout des propriétés de l'entité, pour y accéder directement dans les services sans utiliser le get()
  const formGroup = new FormGroup(formMap) as FarmGroup<typeof entity>;
  for (const key in entity) {
    formGroup[key] = formGroup.get(key)! as any;
  }
  return formGroup;
}

/**
 * Deplace un AbstractControl dans un FarmArray
 * @param formArray Le FarmArray où l'on veut déplacer l'item
 * @param fromIndex L'index de départ de l'item
 * @param targetIndex L'index où l'item doit être déplacé
 */
export function moveItemInFarmArray(
  formArray: FarmArray<any>,
  fromIndex: number,
  targetIndex: number
): void {
  const direction = targetIndex > fromIndex ? 1 : -1;

  const from = fromIndex;
  const target = targetIndex;

  const tempAbstractControl = formArray.at(from);
  for (let i = from; i * direction < target * direction; i = i + direction) {
    const current = formArray.at(i + direction);
    formArray.setControl(i, current);
  }
  formArray.setControl(target, tempAbstractControl);
}
