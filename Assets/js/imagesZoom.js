window.ImagesZoom = function(){
    var $ = jQuery ;
    var self = this;
    this.__group = 'system';
    this.__plugin = 'plg_system_zoom_image' ;
    /**
     * объект Ajax параметров по умолчанию
     * @type {{task: null, plugin: string, format: string, option: string, group: string}}
     */
    this.AjaxDefaultData = {
        option : 'com_ajax' ,
        group : this.__group,
        plugin : this.__plugin ,
        format : 'json' ,
        task : null ,
    };
    this.AjaxDefaultDataPlugin = {};
    /**
     * Селекторы
     * @type {{zoomImg: null, zoomImgParentElement: null, zoomImg_JShopProdAttributes: null, __AddToCart_Btn: null, zoomImgProductId: null}}
     */
    this.selectors = {
        zoomImg : null ,
        zoomImgProductId : null ,
        zoomImg_JShopProdAttributes : null ,
        zoomImgParentElement : null ,
        __AddToCart_Btn : null ,
    };
    /**
     * Атрибуты для товара
     * @type {{}}
     */
    this.AddToCartAttr = {} ;
    this.QuickProductViewModal ;
    /**
     * Индекс выбранного товара
     * Используется для прыжка на слайд выбранного товара
     * @type {boolean}
     */
    this.AttrProductIndex = false ;
    /**
     * Объект для хранения выбранных Атрибутов
     * @type {{}}
     */
    this.setAttrObj = {};

    /**
     * Start Init
     * @constructor
     */
    this.Init = function () {
        Object.assign( this ,  Joomla.getOptions('ImagesZoom') );
        this.AjaxDefaultDataPlugin = this.AjaxDefaultData ;
        var $zoomImg= $(this.selectors.zoomImg);
        // Смотрим в каком представлении находимся
        switch (this.view) {
            case 'product':
                $.each($zoomImg , function (i,a) {
                    $(a).on('click'  , self.modalOpen )
                });
                self.setAttrChecked()
                break ;
            default :
                $.each($zoomImg , function (i,a) {
                    var dataBigImg = $(a).data('big_img');
                    var $parent = $(a).closest( self.selectors.zoomImgParentElement ) ;
                    var div_el = $('<div />',{
                        class : 'bg_hover'
                    });
                    $parent.append(div_el);
                    var a_el = $('<a />' , {
                        href : dataBigImg ,
                        class : 'zoom' ,
                        html : '<i class="fa fa-search"></i>' ,
                        click : self.modalOpen,
                        'data-fancybox': 'quick-view-'+i ,
                    });
                    $parent.append(a_el);

                })
        }
    };
    /**
     * сохраняем отмеченные Аттр.
     */
    this.setAttrChecked = function () {
        // Ищем отмеченные радио атрибутов
        var JShopProdAttributes =  $( self.selectors.zoomImg_JShopProdAttributes ).find('input[type="radio"]:checked');
        if ( !JShopProdAttributes.length ) return ;

        $.each(JShopProdAttributes , function (i,a) {
            var nameInd = 'attr_'+($(a).attr('name').replace(/[^\d]/g, '') ) ;
            self.setAttrObj[nameInd] = $(a).val() ;
        });
    }
    /**
     * Загрузка данных для создания модального окна
     * @param event
     */
    this.modalOpen = function (event) {
        event.preventDefault();
        var data = {
            option : 'com_ajax' ,
            group : self.__group,
            plugin : self.__plugin ,
            format : 'json' ,
            task : null ,
        }
        data.productId = $(this).closest(self.selectors.zoomImgParentElement)
            .find('[data-zoom-image_product_id]').data('zoom-image_product_id');
        if (self.view === 'product' ){
            data.productId = self.product_id ;
        }

        data.category_id = self.category_id ;
        data.task = 'onAjaxGetProduct';
        self.getModul("Ajax").then(function (Ajax) {
            // Не обрабатывать сообщения
            Ajax.ReturnRespond = true ;
            // Отправить запрос
            Ajax.send( data , 'imagesZoom' ).then(function (r) {
                self.render(r.data[0])
            },function(err) {
                console.error(err)
            });
        });
    };
    /**
     * Событие нажатие кнопки купить в панели быстрого просмотра
     * @param event
     * @constructor
     */
    this.AddToCart = function (event) {
        event.preventDefault();
        var data = $.extend(true, self.AjaxDefaultData, {} );
        data.option = 'com_jshopping' ;
        data.controller = 'cart' ;
        data.task = 'add' ;
        data.quantity = 1 ;
        data.to = 'cart' ;
        data = $.extend(true, self.AddToCartData , data );


        console.log( self.AjaxDefaultData )
        console.log( self.AddToCartData )


        self.getModul("Ajax").then(function (Ajax) {
            self.load.css('/plugins/system/plg_system_zoom_image/Assets/css/imagesZoom.productAdded.css') ;
            Ajax.ReturnRespond = true ;  // Не обрабатывать сообщения



            // Отправить запрос
            Ajax.send( data , 'imagesZoom-AddToCart' ).then(function (r) {
                self.renderAdded(r.data.html)
            },function(err) {
                console.error(err)
            });
        });
    };
    /**
     * Создание модального окна после добавления товара в корзину
     * @param html
     */
    this.renderAdded = function (html) {
        self.__loadModul.Fancybox().then(function (a) {
            // Закрыть Quick Product View
            if ( typeof self.QuickProductViewModal !== 'undefined'){
                self.QuickProductViewModal.close();
            }
            a.open( html , {
                baseClass : 'Quick-Product-Added',
            });
        });
    }
    /**
     * Построение модального окна просмотра фотографий товара с кнопкой Купить
     * @param Data - obj объект товара - результат Ajax запроса
     */
    this.render = function (Data) {

        console.log('Data' , Data ) ;
        $(Data.slider__control).appendTo('body') ;
        var imageArr = [] ;
        // Получаем модуль библиотеки GNZ11 Fancybox
        self.__loadModul.Fancybox().then(function (a) {
            var imageArr = [] ;
            var imgOpt = {} ;
            var caption = '';
            var attrs = {};

            // Если к товара есть атрибуты
            if (Data.Attributes.length){
                var image_full  = Data.image ;
                var image_thumb = Data.image ;
                $.each(Data.Attributes , function (i,Attributes) {

                    imgOpt = {} ;
                    caption = '';
                    attrs = {};

                    if (Attributes.Images.length){
                        image_full = Attributes.Images[0].image_full;
                        image_thumb = Attributes.Images[0].image_thumb ;
                    }

                    var ctrl = true ;
                    $.each( self.setAttrObj , function ( x , a ) {
                        if ( Attributes[x] !== a ){
                            // self.AttrProductIndex = false ;
                            ctrl = false ;
                            return ;
                        }
                    })
                    if ( ctrl )  self.AttrProductIndex = i ;




                    imgOpt.src = self.imagePath.full + image_full

                    $.each(Attributes.attr_s , function (k , attr ) {
                        if (attr.value){
                            caption += attr.name +': '+attr.value ;
                            if ( !k ) caption += '<br>'
                            attrs[attr.idAttr] = attr.item ;
                        }
                    });

                    imgOpt.opts = {
                        attr_s_product_price : self.getPriceProduct( Attributes ) /*Attributes.attr_s_product_price*/ ,
                        attrs : attrs ,
                        caption : caption   ,
                        thumb   : self.imagePath.thumb + image_thumb ,
                    };
                    imageArr.push( imgOpt );
                }) ;
            }else{
                // Обработака для товаров у которых нет вложенных товаров
                $.each(Data.Images , function (i,Image) {
                    var Attributes = {} ;
                    var imgOpt = {} ;
                    imgOpt.src =  self.imagePath.full +Image.image_full

                    Attributes.price = Data.product_price ;
                    Attributes.attr_s_product_price = Data.product_currency_price ;

                    imgOpt.opts = {
                        attr_s_product_price : self.getPriceProduct( Attributes ) ,
                        caption : Image.name +'<br>'  ,
                        thumb   : self.imagePath.thumb + Image.image_thumb
                    };
                    imageArr.push( imgOpt );
                })
            }
            function getHtmlProductDetal(Data) {
                return '<div class="product">' +
                    '<div class="product-form">\n' +
                    self.getHtmlProductName (Data) +

                    '<p>' +
                    Data['short_description_ru-RU'] +
                    '</p>' +
                    '<p>' + // data-fancybox-close
                        '<p class="product-prices__big"></p>' +
                        self.getAddToCart( Data ) +
                    '</p>' +
                    '  </div>' +
                    '</div>';
            }
            var html = getHtmlProductDetal(Data) ;
            $('body').append(html)
            self.QuickProductViewModal = a.open(imageArr, {
                baseClass: 'Quick-Product-View',
                animationEffect: "fade",
                animationDuration: 300,
                margin: 0,
                arrows: true ,
                infobar: true,
                gutter: 0,
                touch: {
                    vertical: false
                },
                loop: true,
                thumbs: {
                    // autoStart : true
                },
                baseTpl: self.getTemplate('QuickProductView'),
                btnTpl: {
                    arrowLeft:
                        '<button data-fancybox-prev class="fancybox-button fancybox-button--arrow_left" title="{{PREV}}">' +
                        '<div>' +
                            '<svg aria-hidden="true" height="40" width="16">' +
                                '<use xlink:href="#icon-slider-right" xmlns:xlink="http://www.w3.org/1999/xlink"></use>' +
                            '</svg>' +
                        '</div>' +
                        "</button>",
                    arrowRight:
                        '<button data-fancybox-next class="fancybox-button fancybox-button--arrow_right" title="{{NEXT}}">' +
                            '<div>' +
                                '<svg aria-hidden="true" height="40" width="16">' +
                                    '<use xlink:href="#icon-slider-right" xmlns:xlink="http://www.w3.org/1999/xlink"></use>' +
                                '</svg>' +
                            '</div>' +
                        "</button>",
                },
                /*caption : function( instance, item ) {

                    var caption = $(this).data('caption') || '';
                    if ( item.type === 'image' ) {
                        caption = (caption.length ? caption + '<br />' : '') + '<a href="' + item.src + '">Download image111</a>' ;
                    }
                    Data.Attributes
                    return caption;

                },*/
                onInit: function (instance) {
                    /* #1 Add product form*/
                    /* ===================*/

                    // Find current form element ..
                    var current = instance.group[instance.currIndex];
                    console.log(current)
                    console.log(instance)
                    console.log(instance.$refs.container.find('.fancybox-form-wrap'))


                    // instance.$refs.form = current.opts.$orig.parent().find('.product-form');
                    instance.$refs.form = $('body').find('.product-form');

                    // .. and move to the container
                    instance.$refs.form.appendTo(instance.$refs.container.find('.fancybox-form-wrap'));

                    /* #2 Create bullet navigation links */
                    /* ================================= */
                    var list = '', $bullets;
                    for (var i = 0; i < instance.group.length; i++) {
                        list += '<li><a data-index="' + i + '" href="javascript:;"><span>' + (i + 1) + '</span></a></li>';
                    }
                    // Вешаем обработчик на точки навигации
                    $bullets = $('<ul class="product-bullets">' + list + '</ul>').on('click touchstart', 'a', function () {
                        var index = $(this).data('index');
                        $.fancyboxqqq.getInstance(function () {
                            this.jumpTo(index);
                        });

                    });
                    instance.$refs.bullets = $bullets.appendTo(instance.$refs.stage);


                    var pNameHtml = self.getHtmlProductName ( Data );
                    var CloseBtn = self.getCloseBtn() ;
                    var btnAddToCart = '<div class="wrp-product-prices">' +
                        '<p class="product-prices__big"></p>' +
                        self.getAddToCart( Data )
                        '</div>'

                    $(pNameHtml).appendTo(instance.$refs.stage) ;
                    $(btnAddToCart).appendTo(instance.$refs.stage) ;
                    $(CloseBtn).appendTo(instance.$refs.stage);

                    // Если известны параметры выбранных атрибутов прыгаем на слайд
                    // к товару для этих выбранных атрибутов
                    if ( self.AttrProductIndex ) {
                        $.fancyboxqqq.getInstance().jumpTo( self.AttrProductIndex );
                    }

                },
                afterLoad: function () {
                    // console.info( this  )

                },
                afterShow: function (instance, current) {
                    // console.info( instance );

                },
                beforeShow: function (instance) {

                    self.load.css('/plugins/system/plg_system_zoom_image/Assets/css/imagesZoom.css');

                    // Вешаем обработчик на кнопку купить
                    $(self.selectors.__AddToCart_Btn).off().on( 'click'    , self.AddToCart ) ;

                    // Разделы модального окна
                    var $modalFancybox = $('.fancybox-form-wrap , .fancybox-stage')

                    // Mark current bullet navigation link as active
                    instance.$refs.stage.find('ul:first')
                        .children()
                        .removeClass('active')
                        .eq(instance.currIndex)
                        .addClass('active');

                    // Запоминаем комбинацию атрибутов для добавления в корзину
                    self.AddToCartData = {
                        jshop_attr_id: imageArr[this.index].opts.attrs,
                        product_id: Data.product_id,
                        category_id: self.category_id,
                    };
                    $modalFancybox.find('h4.sub-head').html(imageArr[this.index].opts.caption);

                    console.log( imageArr[this.index].opts.attr_s_product_price )

                    $modalFancybox.find('.product-prices__big').html(imageArr[this.index].opts.attr_s_product_price);





                },
                afterClose: function (instance, current) {

                    // Move form back to the place
                    // instance.$refs.form.appendTo( current.opts.$orig.parent() );

                }
            });

        });
    };
    /**
     * Создать html цены
     * @param Attributes
     * @returns {string|null}
     */
    this.getPriceProduct = function (Attributes) {
        if ( +Attributes.price < 5 ){
            return null ;
        }
        return '<span class="product-price">' +
            Attributes.attr_s_product_price +
            '</span>'
    };
    /**
     * создание кнопки купить Или Кнопка подробней
     */
    this.getAddToCart = function ( Data ) {
        var title = Data.language['PLG_SYSTEM_PLG_SYSTEM_ZOOM_IMAGE_ADD_TO_CART'] ;
        // Для старых товаров у которых нет аттр.
        if (!Data.Attributes.length) {
            Data.Attributes[0]  = {} ;
            Data.Attributes[0].price = Data.product_currency_price ;
        }
        if ( Data.Attributes[0].price < 5 ){
            title = Data.language['PLG_SYSTEM_PLG_SYSTEM_ZOOM_IMAGE_ONLY_ON_ORDER'] ;
            return '<div class="buttons">' +
                        '<a class="button_buy" title="'+title+'" href="'+Data.product_link+'">' +
                            title +
                        '</a>' +
                    '</div>';
        }
        return '<button class="btn AddToCart">' +
            title +
                '</button>'
    };
    /**
     * создание заголовка товара
     * @returns {string}
     * @param  Data object Данные загруженного товара
     */
    this.getHtmlProductName = function (Data) {
        var prefix = Data.language_prefix
        var name = Data['name_'+prefix]
        return  '<div class="heading">' +
                    '<h3>' + name + '</h3>\n' +
                    '<h4 class="sub-head"></h4>'
                '</div>'
                 ;
    }
    /**
     * Создание кнопки закрыть окно
     * Todo привязать к FANCYBOX
     * @returns {string}
     */
    this.getCloseBtn = function () {
        return '<button data-fancybox-close class="fancybox-button fancybox-button--close" title="{{CLOSE}}">' +
                    '<svg viewBox="0 0 40 40">' +
                        '<path d="M10,10 L30,30 M30,10 L10,30" />' +
                    '</svg>' +
                '</button>'
    }
    /**
     * Создать html разметку для окна FANCY BOX
     * Todo привязать к FANCYBOX
     * @param name
     * @returns {string|null}
     */
    this.getTemplate = function ( name ) {
        switch (name) {
            case 'QuickProductView' :
                return '<div class="fancybox-container" role="dialog" tabindex="-1">' +
                            '<div class="fancybox-bg"></div>' +
                            '<div class="fancybox-inner">' +
                                '<div class="fancybox-stage">' +
                                    '<div class="fancybox-navigation">{{arrows}}</div>' +
                                '</div>' +
                                '<div class="fancybox-form-wrap">' +
                                     self.getCloseBtn()+
                                    // '<div class="fancybox-caption ">' +
                                    //     '<div class="fancybox-caption__body">' +
                                    //     // '<a href="https://source.unsplash.com/xAgvgQpYsf4/1500x1000">Download image</a>' +
                                    //     '</div>' +
                                    // '</div>' +
                                '</div>' +
                            '</div>' +
                        '</div>'
            default :
                return null ;
        }
    }
};
window.ImagesZoom.prototype = new GNZ11();
window.ImagesZoomObj = new ImagesZoom();
window.ImagesZoomObj.Init();