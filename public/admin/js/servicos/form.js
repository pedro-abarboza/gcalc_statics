$( function() {
    console.log('init form script')
    $(".datepicker").datepicker({
        language: 'pt-BR'
    });

    $("#cliente").select2({
        placeholder: "Selecione um Cliente",
        allowClear: true,
    });

    $("#tipo_servico").select2({
        placeholder: "Selecione um Tipo de Servico",
        allowClear: true,
    });

    $("#responsavel").select2({
        placeholder: "Selecione um Responsável",
        allowClear: true,
    });

    $("#status").select2({
        placeholder: "Selecione um Status",
        allowClear: true,
    });

    $('#cliente').on('select2:clear', function(e){
        reset_tp()
        reset_rs()
    })

    $('#tipo_servico').on('select2:clear', function(e){
        reset_rs()
    })

    $('#all').on('change', function() {
        $('.checkbox_servico').prop('checked', $(this).prop('checked'));
        // Opcional: para o status parcial/indeterminado
        updateSelectAllState();
    });

    $('.checkbox_servico').on('change', function() {
        updateSelectAllState();
    });

    function updateSelectAllState() {
        const allChecked = $('.checkbox_servico:checked').length === $('.checkbox_servico').length;
        const allUnchecked = $('.checkbox_servico:checked').length === 0;
        const selectAll = $('#all');

        if (allChecked) {
            selectAll.prop('checked', true).prop('indeterminate', false);
        } else if (allUnchecked) {
            selectAll.prop('checked', false).prop('indeterminate', false);
        } else {
            selectAll.prop('checked', false).prop('indeterminate', true);
        }
    }

    $(".processo-inputmask").inputmask("9999999-99.9999.9.99.9999")

});

function carregar_tp(cliente){
    console.log('teste')
    if(cliente.value){
        $.ajax({
            url: URL_TP+'/'+cliente.value,
            type: 'get',
            success: function(data) {
                let select = $('#tipo_servico');
                select[0].innerHTML="";
                data.forEach(function(item) {
                    option = new Option(item[1], item[0], false, false);
                    select.append(option).trigger("change");
                });
                select.val(null).trigger("change");
            }
        });
    }
}

function carregar_rs(tipo_servico){
    let select = $('#responsavel');
    if(tipo_servico.value){
        $.ajax({
            url: URL_RS+'/'+tipo_servico.value,
            type: 'get',
            success: function(data) {
                select[0].innerHTML="";
                data.forEach(function(item) {
                    option = new Option(item[1], item[0], false, false);
                    select.append(option).trigger("change");
                });
                select.val(null).trigger("change");
            }
        });
    }
}

function reset_tp(placeholder){
    let select = $('#tipo_servico');
    select.val(null).trigger("change");
    select[0].innerHTML="";
    select.select2({
        placeholder: 'Selecione um Tipo de Servico',
        allowClear: true
    });
};

function reset_rs(placeholder){
    let select = $('#responsavel');
    select.val(null).trigger("change");
    select[0].innerHTML="";
    select.select2({
        placeholder: 'Selecione um Responsável',
        allowClear: true
    });
}

function filtrar(){
    let form = $("#form").serialize()
    $.ajax({
            url: URL_FILTRO,
            type: 'get',
            data: form,
            success: function(data) {
                let body_table = $('#body_fatura')[0];
                body_table.innerHTML = ''
                data.forEach(item => {
                    const linha = body_table.insertRow();
                    linha.insertCell().textContent = item['0'];
                    linha.insertCell().textContent = item['1'];
                    linha.insertCell().textContent = item['2'];
                    linha.insertCell().textContent = item['3'];
                    linha.insertCell().textContent = item['4'];
                    linha.insertCell().textContent = convertDateFormat(item['5']);
                    linha.insertCell().textContent = convertDateFormat(item['6']);
                    linha.insertCell().textContent = convertDateFormat(item['7']);
                });

            }
        });
}