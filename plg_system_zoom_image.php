<?php
/**
 * @package    plg_system_zoom_image
 *
 * @author     oleg <your@email.com>
 * @copyright  A copyright
 * @license    GNU General Public License version 2 or later; see LICENSE.txt
 * @link       http://your.url.com
 */

defined('_JEXEC') or die;

use Joomla\CMS\Application\CMSApplication;
use Joomla\CMS\Plugin\CMSPlugin;

/**
 * Plg_system_zoom_image plugin.
 *
 * @package   plg_system_zoom_image
 * @since     1.0.0
 */
class plgSystemPlg_system_zoom_image extends CMSPlugin
{
	/**
	 * Application object
	 *
	 * @var    CMSApplication
	 * @since  1.0.0
     * @todo Add temlate
	 */
	protected $app;

	/**
	 * Database object
	 *
	 * @var    JDatabaseDriver
	 * @since  1.0.0
     * @todo Add temlate
	 */
	protected $db;

	/**
	 * Affects constructor behavior. If true, language files will be loaded automatically.
	 *
	 * @var    boolean
	 * @since  1.0.0
     * @todo Add temlate
	 */
	protected $autoloadLanguage = true;

	/**
	 * onAfterInitialise.
	 *
	 * @return  void
	 *
	 * @since   1.0
     * @todo Add temlate
	 */
	public function onAfterInitialise()
	{

	}

	/**
	 * onAfterRoute.
	 *
	 * @return  void
	 *
	 * @since   1.0
     * @todo Add temlate
	 */
	public function onAfterRoute()
	{




	}

	/**
	 * onAfterDispatch.
	 *
	 * @return  void
	 *
	 * @since   1.0
     * @todo Add temlate
	 */
	public function onAfterDispatch()
	{

	}

    /**
     * Перед рендерингом страницы
     * Может использоваться для добавления или исключения скриптов  в
     * самый последний момент
     * @return |null
     * @since 3.9
     * @todo Add temlate
     */
	public function onBeforeRender(){


		# компоненты в которых запускать плагин
		$arrON = [
			'com_jshopping'
		];

		$option = $this->app->input->get('option') ;
		if( !in_array( $option , $arrON ) ) return null; #END IF

		$doc = \Joomla\CMS\Factory::getDocument();
		$Jpro = $doc->getScriptOptions('Jpro') ;
		$Jpro['load'][] = [
			'u' => '/plugins/system/plg_system_zoom_image/Assets/js/imagesZoom.js' , // Путь к файлу
			't' => 'js' ,                                       // Тип загружаемого ресурса
			'c' => '' ,                             // метод после завершения загрузки
		];

		$view = $this->app->input->get( 'controller' , false , 'RAW' ) ;

		switch($view){
			case 'product' :
				$selectors = [
					// Клик по элементу для запуска слайдера
					'zoomImg' => $this->params->get('zoomImg_product' , '#list_product_image_middle .image_full ,#list_product_image_middle .lightbox , .additional-images a'),
					'zoomImgProductId' => $this->params->get('zoomImgProductId_product' , '.jshop.productfull'),
					// Селектор для поиска выбранных атрибутов
					'zoomImg_JShopProdAttributes' => $this->params->get('zoomImg_JShopProdAttributes' , '.jshop_prod_attributes'),

				];

				break ;
			default :
				$selectors = [
					'zoomImg' => $this->params->get('zoomImg' , '.image_block .jshop_img'),
					'zoomImgProductId' => $this->params->get('zoomImgProductId' , '.image_block a'),
					'zoomImgParentElement' => $this->params->get('zoomImgParentElement' , 'td.image'),
				];
		}
		$selectors['__AddToCart_Btn'] = $this->params->get('__AddToCart_Btn' , 'button.btn.AddToCart') ;

		$doc->addScriptOptions('Jpro' , $Jpro ) ;
		$doc->addScriptOptions('ImagesZoom' ,
			[
				'selectors' => $selectors ,

				'view' => $view   ,
				'category_id' => (int)$this->app->input->getInt('category_id') ,
				'product_id' => (int)$this->app->input->getInt('product_id') ,


				# пути к изображениям товара
				'imagePath' => [
					'full' => '/components/com_jshopping/files/img_products/' ,
					'thumb' => '/components/com_jshopping/files/img_products/' ,
				],
			]
		) ;

		return [] ;

	}

	/**
     * Событие после рендеринга
     * Может использоваться для обработки DOM элементов страницы
	 * onAfterRender.
	 *
	 * @return  void
	 *
	 * @since   1.0
     * @todo Add temlate
	 */
	public function onAfterRender()
	{
		// Access to plugin parameters
		$sample = $this->params->get('sample', '42');
	}

	/**
	 * OnAfterCompress.
	 *
	 * @return  void
	 *
	 * @since   1.0
     * @todo Add temlate
	 */
	public function onAfterCompress()
	{

	}

	/**
	 * onAfterRespond.
	 *
	 * @return  void
	 *
	 * @since   1.0
     * @todo Add temlate
	 */
	public function onAfterRespond()
	{

	}

	/**
	 * Точка входа Ajax
	 *
	 * @throws Exception
	 * @since 3.9
	 * @author Gartes
	 * @creationDate 2020-04-30, 16:59
	 * @see {url : https://docs.joomla.org/Using_Joomla_Ajax_Interface/ru }
     * @todo Add temlate
	 */
	public function onAjaxPlg_system_zoom_image()
	{
		JLoader::registerNamespace( 'GNZ11', JPATH_LIBRARIES . '/GNZ11', $reset = false, $prepend = false, $type = 'psr4' );
		JLoader::registerNamespace( 'PlgSystemZoomImage', JPATH_PLUGINS . '/system/plg_system_zoom_image', $reset = false, $prepend = false, $type = 'psr4' );
		$helper = \PlgSystemZoomImage\Helpers\Helper::instance( $this->params );
		$task = $this->app->input->get( 'task', null, 'STRING' );


		try
		{
			// Code that may throw an Exception or Error.
			$results = $helper->$task();
		} catch (Exception $e)
		{
			$results = $e;
		}
		return $results;
	}

	/**
	 * Событие после добавления в корзину
	 * For Component com_joomshoping
	 *
	 * @param $cart
	 * @param $product_id
	 * @param $quantity
	 * @param $attribut
	 * @param $freeattribut
	 * @throws Exception
	 * @since 3.9
     * @todo Add temlate
	 */
	public function onAfterCartAddOk( $cart, $product_id, $quantity, $attribut, $freeattribut ){
		$format = $this->app->input->get('format' , 'html' ,  'WORD') ;
		if( $format == 'html' ) return ; #END IF


		JLoader::registerNamespace( 'GNZ11', JPATH_LIBRARIES . '/GNZ11', $reset = false, $prepend = false, $type = 'psr4' );
		JLoader::registerNamespace( 'PlgSystemZoomImage', JPATH_PLUGINS . '/system/plg_system_zoom_image', $reset = false, $prepend = false, $type = 'psr4' );


		$this->params->set('cartData',['cart'=>$cart,'product_id'=>$product_id,'quantity'=>$quantity,'attribut'=>$attribut,'freeattribut'=>$freeattribut]);
		$helper = \PlgSystemZoomImage\Helpers\Helper::instance( $this->params  );
		$result = $helper->onCartAddedAfter();
		echo new JResponseJson($result) ;
		die();



	}

}
