// Create an immediately invoked functional expression to wrap our code
(function() {

  // Define our constructor 
  this.zeeSlider = function() {

    // Create global element references
    this.nextButton = null;
    this.previousButton = null;
    this.clickTarget = null;
    this.bulletsContainer = null
    this.slider = null;
    this.imagesCount = null;
    this.currentImage = null;
    this.currentImgIndex = null;
    this.currentBullet = null;
    this.timeInterval = null;


    // Define option defaults 
    var defaults = {
      showBullets: true,
      showArrows: true,
      autoPlay: true,
      pauseDuration: 1,
      customClass: "",
      sliderDirection: "left-to-right",  // "right-to-left"
      responsive: true
    }

    // Create options by extending defaults with the passed in arugments
    if (arguments[0] && typeof arguments[0] === "object") {
      this.options = extendDefaults(defaults, arguments[0]);
    }
  }

  // Public Methods

  zeeSlider.prototype.updateImage = function(e) {
    if ( typeof e !== 'undefined' ) {
      this.clickTarget = e.target;
      clearInterval(this.timeInterval);
      this.options.autoPlay = false;
    } else {
      e = null;
    }
    this.currentImage.style.display = 'none';
    updateIndex.call(this);
    updateActiveBullet.call(this);
    playImageAnimation.call(this);
  }

  zeeSlider.prototype.open = function() {
    buildOut.call(this);
    initializeEvents.call(this);
    if (this.options.autoPlay === true) {
      initializeAutoPlay.call(this);
    }
    if (this.options.showBullets === true) {
      initializeBulletsLinks.call(this);
    }
  }

  // Private Methods

  function initializeAutoPlay(){
    var _ = this,
        duration = _.options.pauseDuration * 1000;
    this.timeInterval = window.setInterval(function() {
      _.updateImage.call(_);
    }, duration);
  }

  function buildOut() {

    var sliderHolder,
        docFrag,
        imgsWrapper = document.querySelector(".zeeSlider"),
        imgsList = imgsWrapper.querySelectorAll('img');

    this.currentImage = imgsList[0];
    this.imagesCount = imgsList.length;

    // Create a DocumentFragment to build with
    docFrag = document.createDocumentFragment();

    // Create sliderHolder div
    sliderHolder = document.createElement("div");
    sliderHolder.className = 'zeeSlider_holder';

    // set sliderDirection
    if ( this.options.sliderDirection === 'left-to-right' ) {
      sliderHolder.style.direction = 'ltr';
    } else if ( this.options.sliderDirection === 'right-to-left' ) {
      sliderHolder.style.direction = 'rtl';
    } else {
      sliderHolder.style.direction = '';
    }

    // Create Slider
    this.slider = document.querySelector(".zeeSlider");
    this.slider.className = "zeeSlider" + this.options.className;
    this.slider.style.overflow = 'hidden';
    this.slider.style.height = getImageDimensions(imgsList[0]) + 'px';

    // Append slider to sliderHolder before appending arrows
    sliderHolder.appendChild(this.slider);

    // if showArrows option is true
    if (this.options.showArrows === true) {
      this.nextButton = document.createElement("button");
      this.nextButton.className = "next-image-button";
      this.nextButton.innerHTML = "Next";
      this.previousButton = document.createElement("button");
      this.previousButton.className = "previous-image-button";
      this.previousButton.innerHTML = "Previous";
      sliderHolder.appendChild(this.previousButton);
      sliderHolder.appendChild(this.nextButton);
    }

    // if showBullets option is true
    if (this.options.showBullets === true) {
      this.bulletsContainer = document.createElement('div');
      this.bulletsContainer.className = "zeeSlider-bullets-container";
      for (i=0; i < this.imagesCount; i++) {
        if ( i === 0 ) {
          this.bulletsContainer.innerHTML +=  "<span class='active' data-bullet-index='"+ i +"'>o</span>";
        } else {
          this.bulletsContainer.innerHTML +=  "<span class='' data-bullet-index='"+ i +"'>o</span>";
        };
        imgsList[i].className = "img_" + i;
        imgsList[i].setAttribute('data-img-index', i);
        imgsList[i].style.margin = '0 auto';
        imgsList[i].style.display = ( i === 0 ) ? 'block' : 'none';
      }
      sliderHolder.appendChild(this.bulletsContainer);
    }

    // if customClass option has value append it to zeeSlider_holder
    if ( this.options.customClass !== "" ) {
      sliderHolder.className += (' ' +this.options.customClass);
    }

    // Append sliderHolder to docFrag
    docFrag.appendChild(sliderHolder);
    this.currentImgIndex = parseInt(this.currentImage.dataset.imgIndex); // data name converted to camelCase

    // Append DocumentFragment to body
    document.body.appendChild(docFrag);
  }

  function updateIndex() {
    if ( this.options.autoPlay === true ) {
      if ( this.currentImgIndex < this.imagesCount && this.currentImgIndex !== this.imagesCount - 1 ) {
        this.currentImgIndex++;
      } else {
        this.currentImgIndex = 0;
      }
    } else if ( this.clickTarget === this.nextButton ) {
      if ( this.currentImgIndex < this.imagesCount && this.currentImgIndex !== this.imagesCount - 1 ) {
        this.currentImgIndex++;
      } else {
        this.currentImgIndex = 0;
      }
    } else if ( this.clickTarget === this.previousButton ) {
      if ( this.currentImgIndex > 0 ) {
        this.currentImgIndex--;
      } else {
        this.currentImgIndex = this.imagesCount - 1;
      }
    }
  }

  function initializeBulletsLinks() {
    var _ = this,
        selectAllBullets = this.bulletsContainer.querySelectorAll('span');
    [].forEach.call(selectAllBullets, function(elem) {
      elem.addEventListener('click', function() {
        _.currentImage.style.display = 'none';
        [].forEach.call(selectAllBullets, function(elem) {
          if (elem.classList.contains('active')) {
            elem.classList.remove('active');
          }
        });
        clickedBulletIndex = parseInt(elem.dataset.bulletIndex);
        clickedBullet = _.bulletsContainer.querySelector('[data-bullet-index="' + clickedBulletIndex + '"]');
        clickedBullet.className += 'active';
        _.currentImage = _.slider.querySelector('[data-img-index="' + clickedBulletIndex + '"]');
        playImageAnimation(clickedBulletIndex);
      })
    });
  }

  function updateActiveBullet() {
    var selectAllBullets = this.bulletsContainer.querySelectorAll('span');
    [].forEach.call(selectAllBullets, function(elem) {
      if ( elem.classList.contains('active') ) {
        elem.classList.remove('active');
      }
    });
    this.currentBullet = this.bulletsContainer.querySelector('[data-bullet-index="' + this.currentImgIndex + '"]');
    this.currentBullet.className += ' active';
  }

  function playImageAnimation( imageIndex ) {
    if ( typeof imageIndex !== 'undefined' ) {
      this.currentImage = document.querySelector('[data-img-index="' + imageIndex + '"]');
      this.currentImage.style.display = 'block';
    } else {
      this.currentImage = document.querySelector('[data-img-index="' + this.currentImgIndex + '"]');
      this.currentImage.style.display = 'block';
    }
  }

  function getImageDimensions(image) {
    var imageHeight = image.height;
    return imageHeight;
  }

  function extendDefaults(source, externalProperties) {
    var property;
    for (property in externalProperties) {
      if (source.hasOwnProperty(property)) {
        source[property] = externalProperties[property];
      } else {
        console.log( property + ' is not an option in zeeSlider.' )
      }
    }
    return source;
  }

  function initializeEvents() {

    // if nextButton exists
    if (this.nextButton) {
      this.nextButton.addEventListener('click', this.updateImage.bind(this));
    }

    // if previousButton exists
    if (this.previousButton) {
      this.previousButton.addEventListener('click', this.updateImage.bind(this));
    }

  }

}());

var mySlider = new zeeSlider({
  customClass: 'a_custom_class another_custom_class',
  sliderDirection: 'left-to-right',
  autoPlay: false,
  pauseDuration: 1,
  dummy_option: 'opt_value'
});

mySlider.open();
