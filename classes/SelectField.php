<?php
/**
 *
 * User: Leo Ning.
 * Date: 2017/7/13 0013 上午 11:24
 */

namespace wula\ui\classes;

use wulaphp\form\FormField;

class SelectField extends FormField {
	public function getName() {
		return _tr('Select@form');
	}

	protected function renderWidget($opts) {
		$definition  = $this->options;
		$data        = $this->getDataProvidor()->getData();
		$id          = isset ($definition ['id']) ? $definition ['id'] : $definition ['name'];
		$readonly    = isset ($definition ['readonly']) ? ' readonly="readonly" ' : '';
		$disabled    = isset ($definition ['disabled']) ? ' disabled="disabled" ' : '';
		$placeholder = isset ($definition ['placeholder']) ? ' placeholder="' . $definition ['placeholder'] . '" ' : '';
		$class       = isset ($definition ['class']) ? $definition['class'] : '';
		$multiple    = isset ($definition ['multiple']) ? ' multiple ' : '';
		$html []     = '<select id="' . $id . '" class="form-control ' . $class . '" name="' . $definition ['name'] . '"' . $multiple . $readonly . $disabled . $placeholder . '>';

		if ($data) {
			foreach ($data as $key => $d) {
				if ($key == $this->value) {
					$html [] = '<option value="' . $key . '" selected="selected">' . $d . '</option>';
				} else {
					$html [] = '<option value="' . $key . '">' . $d . '</option>';
				}
			}
		}
		$html [] = '</select>';

		return implode('', $html);

	}
}