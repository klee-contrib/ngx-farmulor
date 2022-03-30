import { FarmArray } from "./farm-abstract-control";

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
