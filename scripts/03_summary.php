<?php
$basePath = dirname(__DIR__);
$fh = fopen($basePath . '/data.csv', 'r');
fgetcsv($fh, 2048);
$count = [];
$dateCount = [];
while($line = fgetcsv($fh, 4096)) {
    if(!isset($count[$line[9]])) {
        $count[$line[9]] = 0;
    }
    $d = substr($line[7], 0, 8);
    if(!isset($dateCount[$d])) {
        $dateCount[$d] = 0;
    }
    ++$count[$line[9]];
    ++$dateCount[$d];
}
ksort($dateCount);
print_r($count);
print_r($dateCount);