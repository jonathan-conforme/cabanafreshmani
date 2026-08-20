import Swal from 'sweetalert2';

// =========================
// INSTANCIA BASE CON ESTILO DEL PROYECTO
// =========================

const BaseAlert = Swal.mixin({
    confirmButtonColor: '#0E7C86',
    cancelButtonColor: '#D64545',
    background: '#FFFDF6',
    color: '#3F3A2E',
    customClass: {
        popup: 'rounded-2xl',
        confirmButton: 'rounded-full px-6 py-2 text-sm font-bold uppercase tracking-wider',
        cancelButton: 'rounded-full px-6 py-2 text-sm font-bold uppercase tracking-wider',
    },
    buttonsStyling: true,
});

// =========================
// CONFIRMACIÓN (ej. eliminar registros)
// =========================

export function confirmAlert({
    title = '¿Estás seguro?',
    text = '',
    icon = 'warning',
    confirmButtonText = 'Sí, continuar',
    cancelButtonText = 'Cancelar',
} = {}) {
    return BaseAlert.fire({
        title,
        text,
        icon,
        showCancelButton: true,
        confirmButtonText,
        cancelButtonText,
        reverseButtons: true,
    }).then((result) => result.isConfirmed);
}

export function confirmDelete(text = 'Esta acción no se puede deshacer.', title = '¿Eliminar registro?') {
    return confirmAlert({
        title,
        text,
        icon: 'warning',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
    });
}

// =========================
// ALERTAS INFORMATIVAS
// =========================

export function successAlert(text = 'Operación realizada con éxito.', title = 'Éxito') {
    return BaseAlert.fire({
        title,
        text,
        icon: 'success',
        confirmButtonText: 'Aceptar',
    });
}

export function errorAlert(text = 'Ha ocurrido un error.', title = 'Error') {
    return BaseAlert.fire({
        title,
        text,
        icon: 'error',
        confirmButtonText: 'Aceptar',
    });
}

export function warningAlert(text = '', title = 'Atención') {
    return BaseAlert.fire({
        title,
        text,
        icon: 'warning',
        confirmButtonText: 'Aceptar',
    });
}

// =========================
// RESTABLECER CONTRASEÑA (dos campos + validación)
// =========================

function escapeHtml(value = '') {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

export function passwordResetAlert(userName = '') {
    return BaseAlert.fire({
        title: 'Restablecer contraseña',
        html:
            `<p class="mb-3 text-sm text-[#7A6A45]">Nueva contraseña para <strong>${escapeHtml(userName)}</strong></p>` +
            '<input id="swal-password" type="password" class="swal2-input" placeholder="Nueva contraseña">' +
            '<input id="swal-password-confirmation" type="password" class="swal2-input" placeholder="Confirmar contraseña">',
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Restablecer',
        cancelButtonText: 'Cancelar',
        reverseButtons: true,
        preConfirm: () => {
            const password = document.getElementById('swal-password').value;
            const confirmation = document.getElementById('swal-password-confirmation').value;

            if (!password || !confirmation) {
                Swal.showValidationMessage('Completa ambos campos.');
                return false;
            }

            if (password !== confirmation) {
                Swal.showValidationMessage('Las contraseñas no coinciden.');
                return false;
            }

            return { password, password_confirmation: confirmation };
        },
    }).then((result) => (result.isConfirmed ? result.value : null));
}

// =========================
// TOAST (esquina superior, se cierra solo)
// =========================

export function toast(text = '', icon = 'success') {
    return BaseAlert.fire({
        toast: true,
        position: 'top-end',
        icon,
        title: text,
        showConfirmButton: false,
        timer: 2500,
        timerProgressBar: true,
    });
}

export default BaseAlert;
