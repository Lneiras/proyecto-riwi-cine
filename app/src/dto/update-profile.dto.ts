// DTO para actualizar el perfil del usuario

// solo se puede actualizar el campo de nombre 
// el roleID y el membershipId no pueden ser actualizados por el usuario
// el campo de email debe pasar por un proceso de verificación antes de ser actualizado

export interface UpdateProfileDto {
    name?: string; //aqui se indica que el nombre es opcional, ya que el usuario puede no querer actualizarlo
    lastName?: string;
    email?: string; // el Email tambien queda como opcional
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; 

// funcion para validar el DTO de actualización de perfil
// la funcion recibe un body de tipo unknown, que es el objeto que se recibe en la petición HTTP
export function validateUpdateProfileDto(body: unknown):{
    valid: boolean;
    error: string;  
    data: UpdateProfileDto
    // sefine la estructura de la respuesta que devolverá la funcion
    // valid: indica si el DTO es válido o no
    // errors: contiene los mensajes de error si el DTO no es válido
    // data: contiene los datos validados del DTO
} {
    const payload = (body ?? {}) as Record<string, unknown>;
    // si body es null o undefined, el operador ?? asigna un objeto vacío {} para evitar que el código falle
    const data: UpdateProfileDto = {};
    // inicia un objeto vacío donde se irán guardando únicamente los datos validos.

    if (payload.name !== undefined) {
        // con esto verificamos que el campo name esté presente en la peticion
        if (typeof payload.name !== 'string' || payload.name.trim().length <2) {
            // esto valida que el campo name sea un 'string' y que tenga al menos 2 caracteres
            // con .trim() descartamos los espacios vacios al inicio y al final del string, para que no se cuenten 
            // como caracteres válidos
            // si el campo name no es válido, se retorna un objeto con valid: false y el mensaje de error
            return {
                valid: false,
                error: 'El campo nombre debe ser un texto de al menos 2 caracteres',
                data
            };
            // si el campo name es válido, se asigna al objeto data
        }
        data.name = payload.name.trim();
    }

    if (payload.lastName !== undefined) {
        if (typeof payload.lastName !== 'string' || payload.lastName.trim().length <2) {
            return {
                valid: false,
                error: 'El campo apellido debe ser un texto de al menos 2 caracteres',
                data
            };
        }
        data.lastName = payload.lastName.trim();
    }


    if (payload.email !== undefined) {
        if (typeof payload.email !== "string" || !EMAIL_REGEX.test(payload.email.trim())) {
                return { valid: false, error: "El campo 'email' debe ser un correo electrónico válido.", data };
            }
        data.email = payload.email.trim().toLowerCase();
    }
    
    if (Object.keys(data).length === 0) {
        // esto verifica si el objeto data está vacío, es decir, si no se proporcionaron campos válidos para }
        // actualizar, de ser asi, se retorna un objeto con valid: false y el mensaje de error de abajo
        return {
            valid: false,
            error: 'Debes enviar al menos un campo válido para actualizar',
            data
        };
    }
    // si el objeto data tiene al menos un campo válido, se retorna un objeto con valid: true y los datos validados
    return {
        valid: true,
        error: '',
        data
    };
}