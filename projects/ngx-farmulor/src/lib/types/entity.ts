import { ValidatorFn } from "@angular/forms";

/** Définition générale d'une entité. */
export interface Entity {
    [key: string]: FieldEntry | ObjectEntry | ListEntry | RecursiveListEntry;
}

/** Métadonnées d'une entrée de type "field" pour une entité. */
export interface FieldEntry<
    DT = any,
    FT extends FieldEntryType<DT> = FieldEntryType<DT>
> {
    /** Domaine du champ. */
    readonly domain: FarmDomain;

    readonly type: "field" | "primitive-list";

    /** Type du champ. */
    readonly fieldType: FT;

    /** Champ obligatoire. */
    readonly isRequired: boolean;

    /** Nom de l'entrée. */
    readonly name: string;
}

export interface PrimitiveListFieldEntry extends FieldEntry {
    readonly type: "primitive-list";
}

/**
 * @description
 * Domaine de valeur du champs
 **/
export interface FarmDomain {
    type:
        | "button"
        | "checkbox"
        | "color"
        | "date"
        | "datetime-local"
        | "email"
        | "file"
        | "hidden"
        | "image"
        | "month"
        | "number"
        | "password"
        | "radio"
        | "range"
        | "reset"
        | "search"
        | "submit"
        | "tel"
        | "text"
        | "time"
        | "url"
        | "week";
    angularValidatorList?: ValidatorFn[];
    pattern?: string;
}

/** Transforme un type effectif en un type à passer à un FieldEntry. */
export type FieldEntryType<T> = T extends string
    ? "string"
    : T extends number
    ? "number"
    : T extends boolean
    ? "boolean"
    : NonNullable<T>;

/** Transforme le type passé à un FieldEntry en type effectif. */
export type FieldType<FT> = FT extends "string"
    ? string
    : FT extends "number"
    ? number
    : FT extends "boolean"
    ? boolean
    : NonNullable<FT>;

/** Métadonnées d'une entrée de type "object" pour une entité. */
export interface ObjectEntry<E extends Entity = any> {
    readonly type: "object";

    /** Entité de l'entrée */
    readonly entity: E;
}

/** Métadonnées d'une entrée de type "list" pour une entité. */
export interface ListEntry<E extends Entity = any> {
    readonly type: "list";

    /** Entité de l'entrée */
    readonly entity: E;
}

/** Métadonnées d'une entrée de type "recursive-list" pour une entité. */
export interface RecursiveListEntry {
    readonly type: "recursive-list";
}

/** Métadonnées d'une entrée de type "recursive-list" pour une entité. */
export interface PrimitiveListEntry {
    readonly type: "primitive-list";
}

/** Génère le type associé à une entité, avec toutes ses propriétés en optionnel. */
export type EntityToType<E extends Entity> = {
    -readonly [P in keyof E]?: E[P] extends FieldEntry
        ? FieldType<E[P]["fieldType"]>
        : E[P] extends ObjectEntry<infer OE>
        ? EntityToType<OE>
        : E[P] extends ListEntry<infer LE>
        ? EntityToType<LE>[]
        : E[P] extends RecursiveListEntry
        ? EntityToType<E>[]
        : never;
};
