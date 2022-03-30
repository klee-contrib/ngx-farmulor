import {
  FormGroup,
} from "@angular/forms";
import {
  Entity,
  ObjectEntry,
  ListEntry,
} from "../types";
import { isArray, forEach } from "lodash";
import { FieldEntry, PrimitiveListEntry, PrimitiveListFieldEntry, RecursiveListEntry } from "../types/entity";
import { FarmArray, FarmControl, FarmGroup, FarmPrimitiveFormArray } from "./farm-abstract-control";

/**
 * Construit un noeud à partir d'une entité, potentiellement de façon récursive.
 * @param entity L'entité de base (dans une liste pour un noeud liste).
 */
export function buildFarm<E extends Entity>(
  entity: E,
  value?: any
): FarmGroup<E>;
export function buildFarm<E extends Entity>(
  entity: E[],
  value?: any
): FarmArray<E>;
export function buildFarm<E extends Entity>(
  entity: E | E[],
  value?: any
): FarmGroup<E> | FarmArray<E> {
  // Cas d'un noeud de type liste : on construit une liste observable à laquelle on greffe les métadonnées et la fonction `set`.
  if (isArray(entity)) {
    return new FarmArray(entity[0], value);
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
          abstractControl = buildFarm(
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
          abstractControl = buildFarm(
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
