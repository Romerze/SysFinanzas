// frontend/src/utils/formattingUtils.js
export const formatCurrency = (value) => {
    if (typeof value !== 'number' || isNaN(value)) {
        // console.warn('formatCurrency received a non-numeric value:', value);
        return 'S/ --.--'; // O alguna representación para valor no válido/no disponible
    }
    return `S/ ${value.toFixed(2)}`;
};

export const formatDate = (dateString) => {
    if (!dateString) return 'Fecha no disponible';
    try {
        const date = new Date(dateString);
        // Ajustar por problemas de zona horaria si la fecha se muestra un día antes/después
        const userTimezoneOffset = date.getTimezoneOffset() * 60000;
        const adjustedDate = new Date(date.getTime() + userTimezoneOffset);
        
        const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
        return adjustedDate.toLocaleDateString('es-PE', options); // Formato dd/mm/yyyy para Perú
    } catch (error) {
        console.error("Error formatting date:", dateString, error);
        return 'Fecha inválida';
    }
};
