const mtch = {
    sh_entry : /^((238p\$)|(\$))(( \S+.*$)|($))/,
    // sh_comm : /^\s*#(( *\S+.*$)|($))/,
    sh_comm : /^.*(#.*)$/,
    gdb_entry : /^\(gdb\)(( \S+.*$)|($))/,
    gdb_comm : /^((\d+$)|(\d+\s+.*$))/,
    // c_comm : /^\s*\/\/.*$/,
    c_comm : /^.*(\/\/.*)$/,
    none : /$^/,
    
}


function setup_environment(lang){
    var env = Object();
    if(lang == null) lang = '';
    switch(lang.toLowerCase()){
    case 'none':
        return {
            entry: mtch.none,
            comment: mtch.none,
            // part_comment: mtch.none,
        };
    case 'gdb':
        return {
            entry: mtch.gdb_entry,
            comment: mtch.gdb_comm,
            // part_comment: mtch.none,
        };
    case 'c':
        return {
            entry: mtch.none,
            comment: mtch.c_comm,
            // part_comment: mtch.c_par_comm,
        };
    case 'sh':
    default:
        return {
            entry: mtch.sh_entry,
            comment: mtch.sh_comm,
            // part_comment: mtch.sh_par_comm,
        };
    }
}


var odd_even = 'odd';
function parse_line(line, lang_env){
    var cls = ['code-line', odd_even];
    switch(odd_even){
    case 'odd': odd_even = 'even'; break;
    case 'even': odd_even = 'odd'; break;
    }
    if(line.match(lang_env.entry) != null){
        cls.push('entry');
    }
    if(line.match(lang_env.comment) != null){
        let comm = line.match(lang_env.comment)[1];
        line = line.replace(comm, wrap_line(comm, 'span', ['comment']));
    }
    return wrap_line(line, 'span', cls);
}


//wrap the naked code line in a span with corresponding classes
function wrap_line(line, tag, cls){
    var str_cls = cls.join(' ');
    return '<'+tag+' class="'+str_cls+'">'+line+'</'+tag+'>';
}


function strip_lines(raw_lines){
    // remove leading and trailing(potential) new lines (\n)
    raw_lines = raw_lines.replace(/^\s*\n/, '');
    raw_lines = raw_lines.replace(/\s*\n\s*$/, '');
    // make an array of lines
    var lines = raw_lines.split('\n');
    // get the indentation of the first line
    var l0 = lines[0];
    var leading_space = '';
    while (l0.indexOf(' ') == '0'){
        leading_space += ' ';
        l0 = l0.substring(1);
    }
    //remove leading_space from all lines
    for(var i=0; i<lines.length; i++){
        lines[i] = lines[i].replace(leading_space, '');
    }
    return lines;
}


function prettify_code(){
    var code_elems = document.getElementsByClassName('code');
    for(var i = 0; i < code_elems.length; i++){
        var tag_name = code_elems[i].tagName.toLowerCase();
        var lang = code_elems[i].getAttribute('lang'); // reads the provided language
        var lines = strip_lines(code_elems[i].innerHTML);
        var lang_env = setup_environment(lang);
        var parsed_line, cls;
        odd_even = 'odd';
        for(var j=0; j<lines.length; j++){
            lines[j] = parse_line(lines[j], lang_env);
        }
        let str_lines = lines.join('\n');
        code_elems[i].outerHTML = wrap_line(str_lines, tag_name, ['code', 'fancy']);
    }
    return;
}

function generate_inner_navs(){
    let titles = document.getElementsByClassName("toc");
    let ulist = document.createElement("ul");
    for (let i = 0; i < titles.length; i++) {
        titles[i].setAttribute("id", i);
        let nme = titles[i].getElementsByTagName("span")[0].innerText;
        let li = document.createElement("li");
        li.innerHTML = '<a href="#'+i+'">'+nme+'</a>';
        ulist.appendChild(li);
    }
    let inner_nav = document.createElement("nav");
    inner_nav.setAttribute("class", "inner-nav");
    inner_nav.appendChild(ulist);
    document.getElementsByTagName("header")[0].
        getElementsByClassName("content")[0].
        appendChild(inner_nav);
    
    return;
}


function actions_post_load(){
    prettify_code();
    generate_inner_navs();
    return;
}

function ready(callbackFunction){
    if(document.readyState != 'loading')
        callbackFunction(event);
    else
        document.addEventListener("DOMContentLoaded", callbackFunction);
}


ready(actions_post_load);
