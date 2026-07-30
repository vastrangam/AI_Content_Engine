'use strict';
/* Module 02 — packs the two edition ZIPs from the one shared module description
   the PDF book also reads, so the two can never disagree. */
const { pack } = require('./packparts.js');
pack(require('./module_m02.js'));
