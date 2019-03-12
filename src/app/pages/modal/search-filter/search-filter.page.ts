import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Storage } from "@ionic/storage";
import { CampaignService } from '../../../services/campaign.service';
import { FormBuilder, FormArray, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-search-filter',
  templateUrl: './search-filter.page.html',
  styleUrls: ['./search-filter.page.scss'],
})
export class SearchFilterPage implements OnInit {
  public form: FormGroup;
  public campaign_id = 1;
  public questions = [];
  public radiusmiles = 1;
  public minmaxprice = {
    upper: 500,
    lower: 10
  };

  constructor (
      private storage: Storage,
      private campaignService: CampaignService,
      private modalCtrl: ModalController,
      private _FB: FormBuilder
  ) {

    this.form = this._FB.group({
      questions: this._FB.array([])
    });

    this.storage.get('campaign').then((campaign) => {
      if (campaign) {
        this.campaign_id = campaign.campaign_id;
      }
    });
  }

  ngOnInit() {
    this.campaignService.getQuestions(this.campaign_id)
      .then((questions: []) => {
        questions.forEach( question => {
          this.addNewInputField(question);
        });
        console.log(questions);
      });
  }

  closeModal() {
    this.modalCtrl.dismiss();
  }

  initQuestionFields(question) : FormGroup {
    return this._FB.group({
      id: [question.question_id, Validators.required],
      question: [question.question, Validators.required],
      response: ['', Validators.required]
    });
  }

  addNewInputField(question) : void {
    const control = <FormArray>this.form.controls.questions;
    control.push(this.initQuestionFields(question));
  }

  public manage(val : any) : void {
    this.campaignService.sendResponses(val);
    this.closeModal();
  }

}
