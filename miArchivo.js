//definición de variables par el programa
const email_valido = "xime@gmail.com";
const pass_valida = "123456";

$(function () {

    function guardarMovimiento(mov) {
        const raw = localStorage.getItem("movimientos");
        const arr = (raw && raw !== "undefined") ? JSON.parse(raw) : [];
        arr.push(mov);
        localStorage.setItem("movimientos", JSON.stringify(arr));
    }

    if ($("#loginForm").length) {
        $("#loginForm").on("submit", function (e) {
            e.preventDefault();

            const $msg = $("#loginMsg").text("").attr("class", "mt-3");
            const email = $("#email").val().trim();
            const pass = $("#password").val().trim();

            if (!email || !pass) {
                $msg.text("Todos los campos deben estar completos").addClass("text-danger");
                return;
            }

            if (email === email_valido && pass === pass_valida) {
                $msg.text("Credenciales correctas, redirigiendo").addClass("text-success");
                window.location.assign("./menu.html");
            } else {
                $msg.text("Email o contraseña inválidos").addClass("text-danger");
            }
        });
    }

    //codigo para la página de menú principal.. que los botones funcionen básicamente

    if ($("#btnDepositar").length && $("#btnEnviar").length && $("#btnMovimientos").length) {

        $("#btnDepositar").on("click", function () {
            $("#menuMsg").text("Redirigiendo a Depositar");
            setTimeout(() => window.location.href = "deposit.html", 500);
        });

        $("#btnEnviar").on("click", function () {
            $("#menuMsg").text("Redirigiendo a Enviar");
            setTimeout(() => window.location.href = "sendmoney.html", 500);
        });

        $("#btnMovimientos").on("click", function () {
            $("#menuMsg").text("Redirigiendo a Últimos Movimientos");
            setTimeout(() => window.location.href = "transactions.html", 500);
        });
    }


    //codigo para la Pantalla depositar

    if (localStorage.getItem("saldo") === null) {
        localStorage.setItem("saldo", "120000");
    }

    if ($("#saldoMenu").length) {
        const saldoActual = Number(localStorage.getItem("saldo")) || 0;
        $("#saldoMenu").text(saldoActual.toLocaleString("es-CL"));
    }

    if ($("#btnDeposito").length && $("#deposit").length) {
        $("#btnDeposito").on("click", function () {
            const monto = Number($("#deposit").val());

            if (!monto || monto <= 0) {
                alert("Ingresa un monto válido mayor a 0");
                return;
            }

            const saldo = Number(localStorage.getItem("saldo")) || 0;
            const nuevoSaldo = saldo + monto;

            guardarMovimiento({
                fecha: new Date().toISOString(),
                monto: monto,
                detalle: "DEPÓSITO"
            });

            localStorage.setItem("saldo", String(nuevoSaldo));
            alert(`Depósito realizado con éxito.\nNuevo saldo: $${nuevoSaldo.toLocaleString("es-CL")}`);
            window.location.href = "menu.html";
        });
    }

    $("#btnVolverMenu").on("click", function () {
        window.location.href = "menu.html";
    });

    //codigo para la pantalla sendmoney.html

    if ($("#btnEnviarDinero").length && $("#selectContacto").length && $("#agenda").length) {

        function nuevoContacto() {
            const raw = localStorage.getItem("contactos");
            if (!raw || raw === "undefined") return [];
            return JSON.parse(raw);
        }

        function guardarContactos(lista) {
            localStorage.setItem("contactos", JSON.stringify(lista));
        }

        function mostrarAgenda(selectedIndex = null) {
            const contactos = nuevoContacto();

            $("#agenda").empty();
            contactos.forEach((c) => {
                $("#agenda").append(`
          <tr>
            <th scope="row">${c.alias}</th>
            <td>${c.nombreCompleto}</td>
            <td>${c.bancoTexto}</td>
            <td>${c.cbu}</td>
          </tr>
        `);
            });

            $("#selectContacto").html(`<option selected disabled value="">Seleccionar</option>`);
            contactos.forEach((c, i) => {
                $("#selectContacto").append(
                    `<option value="${i}">${c.nombreCompleto} — ${c.bancoTexto} (${c.alias})</option>`
                );
            });

            if (selectedIndex !== null) {
                $("#selectContacto").val(String(selectedIndex));
            }
        }

        const raw = localStorage.getItem("contactos");
        if (raw === null || raw === "undefined" || raw === "[]") {
            guardarContactos([
                { alias: "Harry", nombreCompleto: "Harry Potter", bancoTexto: "Banco Gringotts", cbu: "000017943", email: "", tipoCuenta: "" },
                { alias: "Muggle1", nombreCompleto: "Jacob Thornton", bancoTexto: "Banco Estado", cbu: "20648953152", email: "", tipoCuenta: "" },
                { alias: "Muggle2", nombreCompleto: "John Doe", bancoTexto: "Banco Santander", cbu: "00007547965", email: "", tipoCuenta: "" },
            ]);
        }

        mostrarAgenda();

        $("#btnAgregarContacto").on("click", function () {
            const n = $("#nombre").val().trim();
            const a = $("#apellido").val().trim();
            const al = $("#alias").val().trim();
            const cbuval = $("#CBU").val().trim();
            const bankText = $("#banco option:selected").text();
            const emailVal = $("#emailContacto").val().trim(); 
            const tipoVal = $("#tipocuenta").val();

            if (!n || !a || !al || !cbuval || bankText.includes("Selecciona")) {
                alert("Completa los campos vacíos");
                return;
            }

            const contactos = nuevoContacto();
            contactos.push({
                alias: al,
                nombreCompleto: `${n} ${a}`,
                bancoTexto: bankText,
                cbu: cbuval,
                email: emailVal,
                tipoCuenta: tipoVal,
            });

            guardarContactos(contactos);
            mostrarAgenda(contactos.length - 1);

            $("#nombre, #apellido, #alias, #emailContacto, #CBU").val("");
            $("#tipocuenta").prop("selectedIndex", 0);
            $("#banco").prop("selectedIndex", 0);

            const modalEl = document.getElementById("exampleModal");
            const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
            modal.hide();
        });

        $("#btnEnviarDinero").on("click", function () {
            $("#sendMsg").text("").attr("class", "mt-2");

            const idx = $("#selectContacto").val();
            const monto = Number($("#montoEnvio").val());

            if (!idx) {
                $("#sendMsg").text("Selecciona un contacto").addClass("text-danger");
                return;
            }

            if (!monto || monto <= 0) {
                $("#sendMsg").text("Ingresa un monto válido").addClass("text-danger");
                return;
            }

            const saldo = Number(localStorage.getItem("saldo")) || 0;
            if (monto > saldo) {
                $("#sendMsg").text("Saldo insuficiente").addClass("text-danger");
                return;
            }

            const contactos = nuevoContacto();
            const c = contactos[Number(idx)];
            if (!c) {
                $("#sendMsg").text("Contacto inválido, vuelve a seleccionarlo.").addClass("text-danger");
                return;
            }

            const nuevoSaldo = saldo - monto;

            guardarMovimiento({
                fecha: new Date().toISOString(),
                monto: -monto,
                detalle: `TRANSF. A ${c.alias}`
            });

            localStorage.setItem("saldo", String(nuevoSaldo));
            alert(`Enviado $${monto.toLocaleString("es-CL")} a ${c.nombreCompleto}.\nNuevo saldo: $${nuevoSaldo.toLocaleString("es-CL")}`);
            window.location.href = "menu.html";
        });

        $("#btnVolverAlMenu").on("click", function () {
            window.location.href = "menu.html";
        });
    }


    //codigo para la página de transacciones

    if ($("#listaMovs").length) {

        const raw = localStorage.getItem("movimientos");

        if (raw === null || raw === "undefined" || raw === "[]") {
            $("#listaMovs").html(`
      <div class="list-group-item text-center">
        No hay movimientos todavía.
      </div>
    `);
        } else {

            const movs = JSON.parse(raw); 
            $("#listaMovs").empty();

            let i = movs.length - 1;   
            let contador = 0;          
            while (i >= 0 && contador < 5) {

                const m = movs[i];

                const d = new Date(m.fecha);
                const dd = String(d.getDate()).padStart(2, "0");
                const mm = String(d.getMonth() + 1).padStart(2, "0");
                const yyyy = d.getFullYear();
                const fechaTxt = dd + "/" + mm + "/" + yyyy;

                const esIngreso = m.monto > 0;
                const clase = esIngreso ? "list-group-item-success" : "list-group-item-danger";
                const signo = esIngreso ? "+" : "-";
                const montoTxt = Math.abs(m.monto).toLocaleString("es-CL");

                $("#listaMovs").append(`
        <div class="mt-2 small text-muted">${fechaTxt}</div>
        <div class="list-group-item ${clase}">
          ${m.detalle} ${signo}$${montoTxt}
        </div>
      `);

                i--;
                contador++;
            }
        }
    }
});
