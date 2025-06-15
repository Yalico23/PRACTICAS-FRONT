import Swal from "sweetalert2"

import type { SweetAlertIcon } from "sweetalert2";

export const alertasSweet = (titulo: string, mensaje: string, tipo: SweetAlertIcon) => {

    Swal.fire({
        title: titulo,
        text: mensaje,
        icon: tipo,
        confirmButtonText: 'Aceptar',
        customClass: {
            confirmButton: 'btn btn-primary'
        }
    });
}