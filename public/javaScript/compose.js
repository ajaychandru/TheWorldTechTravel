
var editors = [];

$('.ewrapper').each(function (idx, wrapper) {
  var e = new wysihtml.Editor($(wrapper).find('.editable').get(0), {
    toolbar: $(wrapper).find('.toolbar').get(0),
    parserRules: wysihtml5ParserRules,
    stylesheets: "css/stylesheet.css"
    //showToolbarAfterInit: false
  });
  editors.push(e);
});



const boldBtn = document.querySelectorAll('.highlight');


boldBtn.forEach(function (element) {
  element.addEventListener('click', function (event) {
    console.log("clicked");
    this.classList.toggle('bold-selected');
    // Add code to change link color here
  });
})

function checkImageLinkIsHTTP(link) {
  return link.startsWith("http://") || link.startsWith("https://");
}

//to checck whether input url for image is valid or not

const saveBtn=document.getElementById('saveBtn');
const imgURL=document.getElementById('imgURL');
const cancelBtn=document.getElementById('cancelBtn');

const invalidURL=document.getElementById('invalid-url');

imgURL.addEventListener('input',(event)=>{
  event.preventDefault();
  let imageLink = event.target.value;
  console.log(imageLink);
  let isHTTP = checkImageLinkIsHTTP(imageLink);


  if(isHTTP){
    console.log("true");
    invalidURL.classList.remove("d-block");
    saveBtn.disabled = false;
   }else{
  invalidURL.classList.add("d-block")
  saveBtn.disabled = true;
   }
  console.log(isHTTP); 
  console.log("Button disabled:", saveBtn.disabled);

})



// to check empty field

const form = document.getElementById("myForm");
const fileInput = document.getElementById("imgChoosen");
const title=document.getElementById("title");
const textArea=document.getElementById('textArea');

const invalidField=document.querySelectorAll(".invalid-feedback");
if(form){

  form.addEventListener('submit', (event) => {
   
    if(fileInput.files.length == 0 && title.value === '' && textArea.value===''){
      event.preventDefault();
      invalidField[0].classList.add('d-block');
      invalidField[1].classList.add('d-block');
      invalidField[3].classList.add('d-block');
    
      event.preventDefault();
    }

    else if(fileInput.files.length == 0 && title.value === ''){
      event.preventDefault();
      invalidField[0].classList.add('d-block');
      invalidField[1].classList.add('d-block');
      event.preventDefault();
    }
    else if(fileInput.files.length == 0 && textArea.value==='' ){
      event.preventDefault();
      invalidField[1].classList.add('d-block');
      invalidField[3].classList.add('d-block');
      event.preventDefault();
    }
    else if( title.value === '' && textArea.value==='' ){
      event.preventDefault();
      invalidField[1].classList.add('d-block');
      invalidField[3].classList.add('d-block');
      event.preventDefault();
    }
   
    else{
      console.log("all fields entered")
    }


  })

}

// adding functionality to check box
const checkbox = document.getElementById('checkbox');

  checkbox.addEventListener('change', function() {
    if (this.checked) {
      this.value = 'true';
    } else {
      this.value = 'false';
    }
  });











