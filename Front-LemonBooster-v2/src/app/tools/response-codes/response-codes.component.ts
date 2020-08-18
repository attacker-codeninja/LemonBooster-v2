import { ProgramService } from 'src/app/services/program.service';
import { Socket } from 'ngx-socket-io';
import { ToolsService } from 'src/app/services/tools.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import swal from "sweetalert2";

@Component({
  selector: 'app-response-codes',
  templateUrl: './response-codes.component.html',
  styleUrls: ['./response-codes.component.scss']
})
export class ResponseCodesComponent implements OnInit {

  actualPage;
  previousPage;
  nextPage;
  range: Number[] = [];
  totalPages: Number;
  limit = 5;
  filter = '';

  disablePreviousButton: boolean = false;
  disableNextButton: boolean = false;
  disableNextFiveButton: boolean = false;
  disablePreviousFiveButton: boolean = false;

  alives: any;

  responseCodeSubdomain: any;
  responseCodeSubdomains: any;

  statusCode:any;
  subdomain: any;

  scope: any;
  

  program:any;

  socketStatus: boolean = false;
  executing: boolean = false;

  constructor(
    public route : ActivatedRoute,
    public toolService:ToolsService,
    public socket: Socket,
    public programService: ProgramService
  ) { }

  ngOnInit(): void {
    this.checkStatus();
    this.route.params.subscribe(
      (data) => {
        this.toolService.GetEnumerationProgram(data['url'])
        .subscribe((data:any) => {
          this.program = data.data;
        }, (error) => {
          console.error(error);
        });
      });

    this.toolService.GetExecutedSubdomainResponseCodes()
    .subscribe((data:any) => {
      if(data.executing){
        this.executing = true;
        swal.fire({
          html: `<span style='color:grey'>${data.msg}<span>`,
          timer: 20000,
          showConfirmButton: false
        });
      } else {
        this.executing = false;
        swal.fire({
          html: `<span style='color:grey'>${data.msg}<span>`,
          timer: 1000,
          showConfirmButton: false
        });
      }
    }, (error) => {
      swal.fire({
        html: `<span style='color:grey'>${error.error.msg}<span>`,
        timer: 2500,
        showConfirmButton: false
      });
    });
  }


  checkStatus(){
    this.socket.on('connect', () => {
      console.log('Connected to Server.');
      this.socketStatus = true;
      this.executing = false;
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from Server.');
      this.socketStatus = false;
      this.executing = true;
    });
  }

  openSubdomain(subdomain) {
    window.open(subdomain, "_blank");
  }

  executeResponseCodesScanning(scope) {
    this.route.params.subscribe(
      (data) => {

        let Scope = {
          Scope: scope
        }
        
        this.toolService.ExecuteSubdomainResponseCodes(data['url'], Scope)
          .subscribe((data:any) => {

            this.executing = true;
            
            var Payload = {
              Alives: data.alives,
              Enumeration: data.data
            }

            this.toolService.WsExecuteSubdomainResponseCodes(Payload); // Ejecuto herramienta.
            
          }, (error) => {
            console.error(error);
            swal.fire({
              html: `<span style='color:grey'>${error.error.msg}<span>`,
              timer: 2500,
              showConfirmButton: false
            });
          });
      });
  }

  getResponseCodesSubdomains(scope){
    this.scope = scope;
    this.route.params.subscribe(
      (data) => { 
        this.toolService.GetSubdomainResponseCodes(data['url'], 1, 5, this.scope, this.filter)
        .subscribe(data => {
          this.dataTableValidations(data);
        }, (error) => {
          swal.fire({
            html: `<span style='color:grey'>${error.error.msg}<span>`,
            timer: 2500,
            showConfirmButton: false
          });
        });
      });
  }

  next(){ //Pagina Siguiente
    
    this.route.params.subscribe(
      (data) => { 
        this.toolService.GetSubdomainResponseCodes(data['url'], this.nextPage, this.limit, this.scope, this.filter)
        .subscribe(data => {
          this.dataTableValidations(data);
        }, (error) => {
          swal.fire({
            html: `<span style='color:grey'>${error.error.msg}<span>`,
            timer: 2500,
            showConfirmButton: false
          });
        });
      });
  }

  previous(){ //Pagina Previa
    
    this.route.params.subscribe(
      (data) => { 
        this.toolService.GetSubdomainResponseCodes(data['url'], this.previousPage, this.limit, this.scope, this.filter)
        .subscribe(data => {
          this.dataTableValidations(data);
        }, (error) => {
          swal.fire({
            html: `<span style='color:grey'>${error.error.msg}<span>`,
            timer: 2500,
            showConfirmButton: false
          });
        });
      });
  }


  nextFive(){
    this.route.params.subscribe(
      (data) => { 
        this.toolService.GetSubdomainResponseCodes(data['url'], this.actualPage+5, this.limit, this.scope, this.filter)
        .subscribe(data => {
          this.dataTableValidations(data);
        }, (error) => {
          swal.fire({
            html: `<span style='color:grey'>${error.error.msg}<span>`,
            timer: 2500,
            showConfirmButton: false
          });
        });
      });
  }

  previousFive(){
    this.route.params.subscribe(
      (data) => { 
        this.toolService.GetSubdomainResponseCodes(data['url'], (this.actualPage-5), this.limit, this.scope, this.filter)
        .subscribe(data => {
          this.dataTableValidations(data);
        }, (error) => {
          swal.fire({
            html: `<span style='color:grey'>${error.error.msg}<span>`,
            timer: 2500,
            showConfirmButton: false
          });
        });
      });
  }

  entriesChange($event) {
    this.limit = $event.target.value;
    this.route.params.subscribe(
      (data) => { 
        this.toolService.GetSubdomainResponseCodes(data['url'], this.actualPage, this.limit, this.scope, this.filter)
        .subscribe(data => {
          this.dataTableValidations(data);
        }, (error) => {
          swal.fire({
            html: `<span style='color:grey'>${error.error.msg}<span>`,
            timer: 2500,
            showConfirmButton: false
          });
        });
      });
  }

  filterTable($event) {
    this.filter = $event.target.value;
    if ($event.keyCode === 13) {
      this.route.params.subscribe(
        (data) => { 
          this.toolService.GetSubdomainResponseCodes(data['url'], this.actualPage, this.limit, this.scope, this.filter)
          .subscribe(data => {
            console.log(data);
            this.dataTableValidations(data);
          }, (error) => {
            swal.fire({
              html: `<span style='color:grey'>${error.error.msg}<span>`,
              timer: 2500,
              showConfirmButton: false
            });
          });
        });
    }
  }

  dataTableValidations(data){
    this.totalPages = data.totalPages;
    this.alives = [];
  
    this.alives = data.results;
    this.actualPage = data.actualPage;
    this.range = [];

    if((this.actualPage+5) < data.totalPages){
      this.disableNextFiveButton = false;
    } else {
      this.disableNextFiveButton = true;
    }

    if((this.actualPage) > 5){
      this.disablePreviousFiveButton = false;
    } else {
      this.disablePreviousFiveButton = true;
    }
    
    if(!!data.previousPage){
      this.previousPage = data.previousPage.page;
      this.disablePreviousButton = false;
    } else {
      this.disablePreviousButton = true;
    };
    
    if(!!data.nextPage){
      this.nextPage = data.nextPage.page;
      this.disableNextButton = false;
    } else {
      this.disableNextButton = true;
    };
  }

}
