////
//// ATTENTION CE FICHIER EST GENERE AUTOMATIQUEMENT !
////

import { DO_CODE, DO_EMAIL, DO_ID } from "../../domains";
import { ProfilDto, ProfilDtoEntity } from "../securite/profil-dto";
import { TypeUtilisateurCode } from "./references";

export interface UtilisateurDto {
  id?: number,
  email?: string,
  typeUtilisateurCode?: TypeUtilisateurCode,
  profil?: ProfilDto
}

export const UtilisateurDtoEntity = {
  id: {
    type: "field",
    name: "id",
    domain: DO_ID,
    isRequired: false,
    label: "utilisateur.utilisateur.id"
  },
  email: {
    type: "field",
    name: "email",
    domain: DO_EMAIL,
    isRequired: false,
    label: "utilisateur.utilisateur.email"
  },
  typeUtilisateurCode: {
    type: "field",
    name: "typeUtilisateurCode",
    domain: DO_CODE,
    isRequired: false,
    label: "utilisateur.utilisateur.typeUtilisateurCode"
  },
  profil: {
    type: "object",
    entity: ProfilDtoEntity
  }
} as const
