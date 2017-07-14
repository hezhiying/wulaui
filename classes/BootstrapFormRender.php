<?php
/*
 * This file is part of wulacms.
 *
 * (c) Leo Ning <windywany@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace wula\ui\classes;

use wulaphp\form\FormRender;
use wulaphp\form\FormTable;

class BootstrapFormRender extends FormRender {
	/**
	 * 绘制.
	 */
	public function render() {
		$fields = $this->form->createWidgets();
		switch ($this->options['type']) {
			case 'inline':
				return $this->renderInline($fields);
			case 'horizontal':
				return $this->horizontal($fields);
			default:
				return $this->vertical($fields);
		}
	}

	protected function renderInline($fields) {
		return $this->vertical($fields);
	}

	/**
	 * 垂直布局.
	 *
	 * @param array $fields
	 *
	 * @return string
	 */
	protected function vertical($fields) {
		$html   = [];
		$groups = $this->prepareGroups($fields);

		if ($groups) {
			ksort($groups);
			foreach ($groups as $group) {
				ksort($group);
				foreach ($group as $fields) {
					$num = count($fields);
					if ($num > 1) {
						$chunk   = [];
						$chunk[] = '<div class="form-group pull-in clearfix">';
						foreach ($fields as $_field) {
							@list($field, $col) = $_field;
							$chunk[]  = '<div class="' . $col . '">';
							$checkbox = isset($field['checkbox']);

							if ($checkbox) {
								$chunk[] = '<label></label>';
								$chunk[] = '<div class="checkbox">';
								$chunk[] = '<label>' . $field->render($this->options) . $field['label'] . '</label></div>';
							} else {
								if (isset($field['label'])) {
									$chunk[] = '<label>' . $field['label'] . '</label>';
								}
								$chunk[] = $field->render($this->options);
							}

							if (isset($field['note']) && $field['note']) {
								$chunk[] = "<span class=\"help-block m-b-none\">" . $field['note'] . "</span>";
							}
							$chunk[] = '</div>';
						}
						$chunk[] = '</div>';
						$html[]  = implode("\n", $chunk);
					} else {
						$field    = $fields[0][0];
						$col      = $fields[0][1];
						$checkbox = isset($field['checkbox']);
						$chunk    = [];
						// checkbox radio 比较特殊
						if ($col) {
							$chunk[] = '<div class="form-group pull-in clearfix">';
							$chunk[] = '<div class="' . $col . '">';
						} else if ($checkbox) {
							$chunk[] = '<div class="checkbox">';
						} else {
							$chunk[] = '<div class="form-group">';
						}

						if ($checkbox) {
							$chunk[] = '<label>' . $field->render($this->options) . $field['label'] . '</label>';
						} else {
							if (isset($field['label'])) {
								$chunk[] = '<label>' . $field['label'] . '</label>';
							}

							$chunk[] = $field->render($this->options);
						}

						if (isset($field['note']) && $field['note']) {
							$chunk[] = "<span class=\"help-block m-b-none\">" . $field['note'] . "</span>";
						}

						if ($col) {
							$chunk[] = '</div>';
						}

						$chunk[] = '</div>';
						$html[]  = implode("\n", $chunk);
					}
				}
			}
		}

		return implode("\n", $html);
	}

	/**
	 * 标签水平放置.
	 *
	 * @param array $fields
	 *
	 * @return string
	 */
	protected function horizontal($fields) {
		$html   = [];
		$groups = $this->prepareGroups($fields);
		if ($groups) {
			ksort($groups);
			foreach ($groups as $group) {
				ksort($group);
				foreach ($group as $fields) {
					$num = count($fields);
					if ($num > 1) {
						$chunk   = [];
						$chunk[] = '<div class="form-group">';//1
						$field   = $fields[0][0];
						if (isset($field['label'])) {
							$chunk[] = '<label class="control-label ' . $this->options['label-col'] . '">' . $field['label'] . '</label>';
						} else {
							$chunk[] = '<label class="control-label ' . $this->options['label-col'] . '">&nbsp;</label>';
						}
						$chunk[] = '<div class="' . $this->options['field-col'] . '">';//2
						$chunk[] = '<div class="row">';
						foreach ($fields as $_field) {
							@list($field, $col) = $_field;
							$chunk[]  = '<div class="' . $col . '">';//3
							$checkbox = isset($field['checkbox']);

							if ($checkbox) {
								$chunk[] = '<div class="checkbox">';
								$chunk[] = '<label>' . $field->render($this->options) . $field['label'] . '</label></div>';
							} else {
								$chunk[] = $field->render($this->options);
							}

							if (isset($field['note']) && $field['note']) {
								$chunk[] = "<span class=\"help-block m-b-none\">" . $field['note'] . "</span>";
							}

							$chunk[] = '</div>';//3
						}
						$chunk[] = '</div></div></div>';//1,2
						$html[]  = implode("\n", $chunk);
					} else {
						$field    = $fields[0][0];
						$col      = $fields[0][1];
						$checkbox = isset($field['checkbox']);
						$chunk    = [];
						// checkbox radio 比较特殊
						$chunk[] = '<div class="form-group">';//1
						// label

						if (isset($field['label']) && !$checkbox) {
							$chunk[] = '<label class="control-label ' . $this->options['label-col'] . '">' . $field['label'] . '</label>';
						} else {
							$chunk[] = '<label class="control-label ' . $this->options['label-col'] . '">&nbsp;</label>';
						}
						$chunk[] = '<div class="' . $this->options['field-col'] . '">';//2

						if ($col) {
							$chunk[] = '<div class="row"><div class="' . $col . '">';//3
						}

						if ($checkbox) {
							$chunk[] = '<div class="checkbox"><label>' . $field->render($this->options) . $field['label'] . '</label></div>';
						} else {
							$chunk[] = $field->render($this->options);
						}
						if (isset($field['note']) && $field['note']) {
							$chunk[] = "<span class=\"help-block m-b-none\">" . $field['note'] . "</span>";
						}

						if ($col) {
							$chunk[] = '</div></div>';//3
						}

						$chunk[] = '</div></div>';//1,2
						$html[]  = implode("\n", $chunk);
					}
				}
			}
		}

		return implode("\n", $html);
	}

	/**
	 * 行内表单.
	 *
	 * @param FormTable $form
	 *
	 * @return \wula\ui\classes\BootstrapFormRender
	 */
	public static function inline(FormTable $form) {
		return new BootstrapFormRender($form, ['type' => 'inline']);
	}

	/**
	 * 标签垂直放置表单.
	 *
	 * @param \wulaphp\form\FormTable $form
	 *
	 * @return \wula\ui\classes\BootstrapFormRender
	 */
	public static function v(FormTable $form) {
		return new BootstrapFormRender($form, ['type' => 'vertical']);
	}

	/**
	 * 标签水平放置表单.
	 *
	 * @param \wulaphp\form\FormTable $form
	 * @param array                   $options 选项，通过label-col要配置标签的宽度,field-col设置字段宽度
	 *
	 * @return \wula\ui\classes\BootstrapFormRender
	 */
	public static function h(FormTable $form, $options = []) {
		$options['type'] = 'horizontal';
		if (!isset($options['label-col']) || !isset($options['field-col'])) {
			$options['label-col'] = 'col-lg-2 col-sm-3';
			$options['field-col'] = 'col-lg-10 col-sm-9';
		}

		return new BootstrapFormRender($form, $options);
	}

	/**
	 * @param $fields
	 *
	 * @return array
	 */
	private function prepareGroups($fields) {
		$groups = [];
		$j      = 0;
		/**@var \wulaphp\form\FormField $field */
		foreach ($fields as $i => $field) {
			$layout = $field->layout();
			@list($row, $col, $o) = $layout;
			if ($row) {
				$groups[ intval($row) ]['g'][] = [$field, $col, $o];
			} else {
				$groups[ $j ]['n'][] = [$field, false, false];
			}
			$j++;
		}

		return $groups;
	}
}