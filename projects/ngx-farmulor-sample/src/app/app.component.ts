import { Component, OnInit } from '@angular/core';
import { NgxFarmulorService, Farmulor } from 'ngx-farmulor';
import { UtilisateurDtoEntity } from '../model/utilisateur/utilisateur-dto';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'ngx-farmulor-sample';
  constructor(public ngxFarmulorService: NgxFarmulorService) {
    this.utiliateurForm = this.ngxFarmulorService.build(UtilisateurDtoEntity)
  }

  utiliateurForm: Farmulor<typeof UtilisateurDtoEntity>;

  ngOnInit(): void {
    const grom = this.utiliateurForm.farmGroup;
    const formControl = grom.id; // Le FormControl typé a été créé !!
  }
}
