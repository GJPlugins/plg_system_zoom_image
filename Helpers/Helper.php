<?php


	namespace PlgSystemZoomImage\Helpers;


	use Exception;
	use Joomla\CMS\Factory;
	use stdClass;

	class Helper
	{
		/**
		 * @var \Joomla\CMS\Application\CMSApplication|null
		 * @since 3.9
		 */
		private $app;
		/**
		 * @var \JDatabaseDriver|null
		 * @since 3.9
		 */
		private $db;
		public static $instance;
		private $params ;
		/**
		 * helper constructor.
		 * @throws Exception
		 * @since 3.9
		 */
		private function __construct( $options = array() )
		{
			$this->app = Factory::getApplication();
			$this->db = Factory::getDbo();
			$this->params = $options ;
			return $this;
		}#END FN

		/**
		 * @param array $options
		 *
		 * @return Helper
		 * @throws Exception
		 * @since 3.9
		 */
		public static function instance( $options = array() )
		{
			if( self::$instance === null )
			{
				self::$instance = new self( $options );
			}
			return self::$instance;
		}#END FN

		/**
		 * Получение информации о товаре для которого нажали увеличить фото
		 * @return mixed
		 * @since 3.9
		 */
        public function onAjaxGetProduct()
        {
            $productId = $this->app->input->get('productId', null, 'INT');
            $default_category_id = $this->app->input->get('category_id', 0, 'INT');

            $query = $this->db->getQuery(true);
            $query->select('p.product_id ' . ', a.*');
            $query->from('#__jshopping_products AS p');

            $query->leftJoin('#__jshopping_products_attr AS a ON a.ext_attribute_product_id = p.product_id');
            $query->where('parent_id = ' . $productId . ' AND a.price > 0 ');
            $this->db->setQuery($query);
            $result = $this->db->loadAssocList();


            $table_product = \JTable::getInstance('product', 'jshop');
            $table_product_attr = \JTable::getInstance('product', 'jshop');
            $table_product->load($productId);

            $table_product->Images = $table_product->getImages();


            $_attributevalue = \JSFactory::getTable('AttributValue', 'jshop');
            $all_attr_values = $_attributevalue->getAllAttributeValues(1);

            $attr = \JSFactory::getTable('attribut', 'jshop');

            $table_product->Attributes = $table_product->getAttributes();
            foreach ($table_product->Attributes as $i => $attribute) {
                $product_price = formatprice(getPriceFromCurrency($attribute->price));
                $table_product->Attributes[$i]->attr_s_product_price = $product_price;


                foreach ($attribute as $key => $item) {
//					$key = 'attr_4' ;
                    $pattern = '/^attr_\d+$/';
                    preg_match($pattern, $key, $matches);
                    if (!count($matches)) {
                        continue;
                    }#END IF
                    $idAttr = (explode('_', $key))[1];

                    $table_product->Attributes[$i]->attr_s[] = [
                        'idAttr' => $idAttr,
                        'item' => $item,
                        'name' => $attr->getName($idAttr),
                        'value' => $all_attr_values[$item]
                    ];
                }#END FOREACH

            }#END FOREACH

            foreach ($table_product->Attributes as $k => $attribute) {
                $table_product_attr->load($attribute->ext_attribute_product_id);
                $table_product->Attributes[$k]->Images = $table_product_attr->getImages();

            }#END FOREACH

            $table_product->language_prefix = $this->getDefaultLanguage();
            $table_product->language = [
                'PLG_SYSTEM_PLG_SYSTEM_ZOOM_IMAGE_ONLY_ON_ORDER' => \Joomla\CMS\Language\Text::_('PLG_SYSTEM_PLG_SYSTEM_ZOOM_IMAGE_ONLY_ON_ORDER'),
                'PLG_SYSTEM_PLG_SYSTEM_ZOOM_IMAGE_ADD_TO_CART' => \Joomla\CMS\Language\Text::_('PLG_SYSTEM_PLG_SYSTEM_ZOOM_IMAGE_ADD_TO_CART'),
            ];
            $table_product->slider__control = $this->loadTemplate('slider__control');

            # Получить ссылки на продукт
            $arr = [$table_product];
            addLinkToProducts($arr, $default_category_id);
            $table_product = $arr[0];
            $table_product->product_currency_price = formatprice(getPriceFromCurrency($table_product->product_price));


            return $table_product;

        }

		/**
		 * Событие когда товар был добавлен в корзину
		 * Component com_joomshoping
		 * @return stdClass
		 * @since 3.9
		 */
		public function onCartAddedAfter(){
			$data = new stdClass() ;
			$data->html = $this->loadTemplate('product_added') ;
			return $data ;
		}

		/**
		 * Загрузите файл макета плагина. Эти файлы могут быть переопределены с помощью стандартного Joomla! Шаблон
		 *
		 * Переопределение :
		 *                  JPATH_THEMES . /html/plg_{TYPE}_{NAME}/{$layout}.php
		 *                  JPATH_PLUGINS . /{TYPE}/{NAME}/tmpl/{$layout}.php
		 *                  or default : JPATH_PLUGINS . /{TYPE}/{NAME}/tmpl/default.php
		 *
		 *
		 * переопределяет. Load a plugin layout file. These files can be overridden with standard Joomla! template
		 * overrides.
		 *
		 * @param string $layout The layout file to load
		 * @param array  $params An array passed verbatim to the layout file as the `$params` variable
		 *
		 * @return  string  The rendered contents of the file
		 *
		 * @since   5.4.1
         * @todo Add temlate
		 */
		private function loadTemplate ( $layout = 'default' )
		{
			$path = \Joomla\CMS\Plugin\PluginHelper::getLayoutPath( 'system', 'plg_system_zoom_image', $layout );
			// Render the layout
			ob_start();
			include $path;
			return ob_get_clean();
		}

		/**
         * Получение префикса языка установленного в Joomla
		 * Get front-end default language
		 * @return string - префикс языка
		 * @since 3.9
         * @todo Add temlate
		 */
		public static function getDefaultLanguage ($for = 'site' )
		{
			$params = \Joomla\CMS\Component\ComponentHelper::getParams( 'com_languages' );
			return $params->get( $for , 'en-GB' );
		}

	}