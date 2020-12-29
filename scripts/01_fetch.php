<?php
file_put_contents(dirname(__DIR__) . '/data.json', file_get_contents('https://data.coa.gov.tw/Service/OpenData/DataFileService.aspx?UnitId=H76'));