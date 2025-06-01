//RUT

$(document).ready(function () {
  // Evento de entrada de texto en el campo con id "run"
  $("#run").on("input", function () {
    // Eliminar caracteres no válidos (solo permitir números y 'k' o 'K')
    let value = this.value.replace(/[^0-9kK]/g, "");

    // Si el valor contiene un guion, tomar solo la parte antes del guion
    if (value.includes("-")) {
      let parts = value.split("-");
      value = parts[0];
    }

    // Limitar la longitud a 8 caracteres
    if (value.length > 8) {
      value = value.slice(0, 8);
    }

    // Si la longitud es 8, calcular el dígito verificador (DV)
    if (value.length === 8) {
      const dv = calcularDV(value);
      this.value = value;
    }
  });

  // Evento cuando el campo "run" pierde el foco
  $("#run").on("blur", function () {
    // Eliminar caracteres no válidos (solo permitir números y 'k' o 'K')
    let value = this.value.replace(/[^0-9kK]/g, "");

    // Si la longitud es 8, calcular y agregar el dígito verificador (DV)
    if (value.length === 8) {
      const dv = calcularDV(value);
      this.value = `${value}-${dv}`;
    }
  });

  // Función para calcular el dígito verificador (DV)
  const calcularDV = (rut) => {
    let suma = 0;
    let multiplicador = 2;

    // Calcular la suma ponderada de los dígitos del RUT
    for (let i = rut.length - 1; i >= 0; i--) {
      suma += parseInt(rut[i]) * multiplicador;
      multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
    }

    // Calcular el resto de la suma módulo 11
    const resto = 11 - (suma % 11);

    // Devolver el dígito verificador según el resto
    if (resto === 11) {
      return "0";
    } else if (resto === 10) {
      return "K";
    } else {
      return resto.toString();
    }
  };
});

//RESTRICCIONES

$(document).ready(function () {
  $("#nombre").on("input", function () {
    this.value = this.value.replace(/[^A-Za-z]/g, "");
  });

  $("#run").on("input", function () {
    this.value = this.value.replace(/\D/g, "");
  });

  $("#email").on("input", function () {
    this.value = this.value.replace(/[^A-Za-z]/g, "");
  });

  $("#fono").on("input", function () {
    this.value = this.value.replace(/\D/g, "");
  });

  $("#password").on("input", function () {
    this.value = this.value.replace(/[^A-Za-z]/g, "");
  });
});
