<?php
$basePath = dirname(__DIR__);
$page = 0;
$lastPageFile = $basePath . '/raw/lastPage';
if(!file_exists($lastPageFile)) {
  file_put_contents($lastPageFile, '1');
}
$lastPage = file_get_contents($lastPageFile);
$page = $lastPage - 1;
while(++$page) {
  $pageOffset = ($page - 1) * 500;
  $targetFile = $basePath . '/raw/page_' . $page . '.json';
  $json = shell_exec("curl -k 'https://scene.coa.gov.tw/server/rest/services/taiwan_pig/taiwan_pig_store/MapServer/0/query?where=OBJECTID%3E0&resultOffset={$pageOffset}&orderByFields=OBJECTID&outFields=*&returnGeometry=true&f=json' -H 'Host: scene.coa.gov.tw' -H 'User-Agent: Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:54.0) Gecko/20100101 Firefox/54.0' -H 'Accept: */*' -H 'Accept-Language: en-US,en;q=0.5' -H 'Accept-Encoding: gzip, deflate, br' -H 'Content-Type: application/x-www-form-urlencoded' -H 'Referer: https://scene.coa.gov.tw/taiwanpork/' -H 'Connection: keep-alive'");
    $json = gzdecode($json);
    $obj = json_decode($json, true);
    if(isset($obj['features'][0])) {
      file_put_contents($targetFile, $json);
    } else {
      die('done');
    }
  file_put_contents($lastPageFile, $page);
}