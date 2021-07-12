import '../sass/style.scss';
import autoComplete from './modules/autoComplete';
import { $, $$ } from './modules/bling';
import typeAhead from './modules/typeAhead';
import makeMap from './modules/map';
import ajaxHeart from './modules/heart';

typeAhead($('.search'))
autoComplete($('#address'),$('#lat'),$('#lng'));
makeMap($('#map'))

const heartForms=$$('form.heart');
heartForms.on('submit',ajaxHeart);
