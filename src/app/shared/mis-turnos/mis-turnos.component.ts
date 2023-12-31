import { Component, OnInit } from '@angular/core';
import { OtroService } from 'src/app/services/otro.service';
import { ReservaService } from 'src/app/services/reserva.service';
import { TurnoService } from 'src/app/services/turno.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { HistoriaClinica } from 'src/app/models/HistoriaClinica';

@Component({
  selector: 'app-mis-turnos',
  templateUrl: './mis-turnos.component.html',
  styleUrls: ['./mis-turnos.component.scss']
})
export class MisTurnosComponent implements OnInit {
  turnosOriginal: any[] = [];
  turnos: any[] = [];  
  turnoSeleccionado: any;

  filtro: string = '';

  modoNormal: boolean = true;
  modoCancelar: boolean = false;
  modoReview: boolean = false;
  modoCompletarEncuesta: boolean = false;
  modoCalificarAtencion: boolean = false;
  modoRechazar: boolean = false;
  modoFinalizar: boolean = false;

  miRol: string = '';

  constructor(
    private turnoService: TurnoService,
    private reservaService: ReservaService,
    private otroService: OtroService,
    private usuarioService: UsuarioService) { }

  ngOnInit(): void {
    this.otroService.getDocumentSnapshotDeUsuario().subscribe(
      ds => {
        this.miRol = ds.data().rol;

        if (this.miRol === 'administrador') {          
          this.turnoService.getRef()
            .onSnapshot(
              qs => this.cargarTurnos(qs)
            )
        }
        else {
          const miUID = ds.id;
          let idTipo = '';

          if (this.miRol === 'piloto') {
            idTipo = 'idPac';
          }
          else if (this.miRol === 'instructor') {
            idTipo = 'idEsp';
          }

          this.turnoService.getRef()
            .where(idTipo, '==', miUID)
            .onSnapshot(
              qs => this.cargarTurnos(qs)
            )
        }
      }
    );
  }

  cargarTurnos(qs: any) {
    this.turnosOriginal = [];
    
    qs.forEach((doc:any) => {
      const id: string = doc.id;
      const data: any = doc.data();

      this.turnosOriginal.push({...data, id});
    });

    this.turnos = this.turnosOriginal.slice();
  }

  // filtrar() {
  pilotoFiltrar() {
    if (this.filtro === '') {
      this.turnos = this.turnosOriginal.slice();
    }
    else {
      const filtrados: any[] = [];

      this.turnosOriginal.forEach(
        turno => {
          if(
            turno.instruccion.includes(this.filtro) ||
            turno.instructor.nombre.includes(this.filtro) || // piloto.nombre
            turno.instructor.apellido.includes(this.filtro) // piloto.apellido
            ) {
            filtrados.push(turno);
          }
        }
      )

      this.turnos = filtrados.slice();
    }
  }
  instructorFiltrar() {
    if (this.filtro === '') {
      this.turnos = this.turnosOriginal.slice();
    }
    else {
      const filtrados: any[] = [];

      this.turnosOriginal.forEach(
        turno => {
          if(
            turno.instruccion.includes(this.filtro) ||
            turno.piloto.nombre.includes(this.filtro) ||
            turno.piloto.apellido.includes(this.filtro)
            ) {
            filtrados.push(turno);
          }
        }
      )

      this.turnos = filtrados.slice();
    }
  }

  volverHandler() {
    this.modoNormal = true;
    this.modoCancelar= false;
    this.modoReview= false;
    this.modoCompletarEncuesta= false;
    this.modoCalificarAtencion= false;
    this.modoRechazar= false;
    this.modoFinalizar= false;
  }

  cancelarTurnoHandler(turno: any) {
    this.turnoSeleccionado = turno;

    this.modoNormal = false;
    this.modoCancelar = true;
  }
  cancelarConfirmarHandler(razon: string) {
    const nuevoTurno = {
      estado: 'cancelado',
      razon: razon
    };

    this.turnoService.actualizar(this.turnoSeleccionado.id, nuevoTurno)
      .then(
        () => this.reservaService.eliminar(this.turnoSeleccionado.idEsp, this.turnoSeleccionado.fecha)        
      )
      .then(
        () => {
          this.modoNormal = true;
          this.modoCancelar = false;
        }
      )
  }

  rechazarTurnoHandler(turno: any) {
    this.turnoSeleccionado = turno;

    this.modoNormal = false;
    this.modoRechazar = true;
  }
  rechazarConfirmarHandler(razon: string) {
    const nuevoTurno = {
      estado: 'rechazado',
      razon: razon
    };

    this.turnoService.actualizar(this.turnoSeleccionado.id, nuevoTurno)
      .then(
        () => this.reservaService.eliminar(this.turnoSeleccionado.idEsp, this.turnoSeleccionado.fecha)        
      )
      .then(
        () => {
          this.modoNormal = true;
          this.modoRechazar = false;
        }
      )
  }

  completarEncuestaHandler() {
    
  }
  
  calificarAtencionHandler(turno: any) {
    this.turnoSeleccionado = turno;

    this.modoNormal = false;
    this.modoCalificarAtencion = true;
  }
  calificarConfirmarHandler(review: string) {
    this.turnoService.actualizar(this.turnoSeleccionado.id, {reviewPac: review})
      .then(
        () => {
          this.modoNormal = true;
          this.modoCalificarAtencion = false;
        }
      )
  }

  verReviewHandler(turno: any) {
    this.turnoSeleccionado = turno;

    this.modoNormal = false;
    this.modoReview = true;
  }

  aceptarTurnoHandler(turno: any) {
    this.turnoService.actualizar(turno.id, {estado: 'aceptado'});
  }
  
  finalizarTurnoHandler(turno: any) {
    this.turnoSeleccionado = turno;

    this.modoNormal = false;
    this.modoFinalizar = true;
  }
  finalizarConfirmarHandler(reviewEHistoriaClinica: {review:string, historiaClinica:any}) {
    const review = reviewEHistoriaClinica.review;
    const hc = reviewEHistoriaClinica.historiaClinica;

    this.usuarioService.updatePiloto(this.turnoSeleccionado.idPac, hc)
      .then(
        () => {
          const turnoActualizado = {
            estado: 'realizado',
            reviewEsp: review,
            piloto: {
              ...this.turnoSeleccionado.piloto,
              historiaClinica: hc
            }
          };

        this.turnoService.actualizar(this.turnoSeleccionado.id, turnoActualizado)
          .then(
            () => this.reservaService.eliminar(this.turnoSeleccionado.idEsp, this.turnoSeleccionado.fecha)        
          )
          .then(
            () => {
              this.modoNormal = true;
              this.modoFinalizar = false;
            }
          )
      });
  }

}
