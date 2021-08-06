function breakText(d, maxWidth){

    length = d.length;
    words = d.split(" ");
    phrase = ""
    phrases = []

    if(d.length <= maxWidth){
      phrases = d
    }else{

      for(i in words){
          if(phrase.length + words[i].length <= maxWidth){
            phrase += words[i] + " ";
          }else{
            phrases.push(phrase.trim())
            phrase = words[i] + " "       
          }
        }
        phrases.push(phrase.trim())
      }
    return phrases
} 

function className(d){
    var s = d.trim().split(' ');
    newClass = '';
    s.forEach((e) => (newClass += e));
    s = newClass.replace('.', '').replace(',', '');
    return s;
  };

var focus = d3
    .scaleOrdinal()
    .domain(key_focus.map((d) => d.key))
    .range(key_focus.map((d) => d.order));

var surname = function(author_name){
    //separete names
    names = author_name.split(" ")  

    last = " " + names.pop() +", "
    first_letter = names[0][0] + "."

    return (last + first_letter)
}