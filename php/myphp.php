<?php  
	
	// In case request method is POST.
	if(strcasecmp($_SERVER['REQUEST_METHOD'], 'POST') == 0) { 
		
		if(isset($_SERVER['CONTENT_TYPE'])) {
			$contentType = $_SERVER["CONTENT_TYPE"];
			$contentType = explode("; ", $contentType)[0];
		} else 
			$contentType = "";
		
		if(strcasecmp($contentType, "application/json") == 0) { 
			// Empty body check.
			$input = file_get_contents("php://input");
			if (!$input)
				die(header("HTTP/1.1 400 Bad Request"));
			
			$json = trim($input);
			$data = json_decode($json);
		
			// Checks validity of json and each required field.
			// If error occurs, it terminates with a Bad Request.
			if (json_last_error() != JSON_ERROR_NONE){
				die(header("HTTP/1.1 400 Bad Request"));
			}
			if(!(isset($data->address) && isset($data->region) && isset($data->city))){
				die(header("HTTP/1.1 400 Bad Request"));
			}
							
			// Connection with database. If error occurs, it terminates with a Server Error.
			$conn = mysqli_connect("localhost", "root", "") or die(header("HTTP/1.1 500 Server Error")); 
			mysqli_select_db($conn , "logs") or die(header("HTTP/1.1 500 Server Error")); 
			$time = time();
			$query = "INSERT INTO requests (timestamp, address, region, city) VALUES ($time,'$data->address', '$data->region', '$data->city')";
			$result = mysqli_query($conn, $query) or die(header("HTTP/1.1 500 Server Error")); 
			header("HTTP/1.1 201 Created"); 
			mysqli_close($conn); // Termination of connection.
		}
	}
	
	// In case request method is GET.
	if(strcasecmp($_SERVER['REQUEST_METHOD'], 'GET') == 0) { 		
		
		// Creation of an array named data that will have the data to be returned.
		$data=array();
		
		// Connection with database. If error occurs, it terminates with a Server Error.
		$conn = mysqli_connect("localhost", "root", "") or die(header("HTTP/1.1 500 Server Error")); 
		mysqli_select_db($conn , "logs") or die(header("HTTP/1.1 500 Server Error"));
		$query = "SELECT * FROM requests ORDER BY timestamp DESC LIMIT 5";
		$result = mysqli_query($conn, $query) or die(header("HTTP/1.1 500 Server Error"));
		
		
		$num = mysqli_num_rows($result);// Returns number of rows from a select query. 
		
		// Loop for all fetched rows.
		for($i=0; $i<$num; $i++) {
			$row = mysqli_fetch_assoc($result);// Returns the next row as an associative array.
			$object = new StdClass; // Use of new statement to create an object.
			$object->timestamp = $row['timestamp'];
			$object->address = $row['address'];
			$object->region = $row['region'];
			$object->city = $row['city'];
			array_push($data, $object); 
		}
		
		// Adjust appropriate headers.
		header("HTTP/1.1 200 OK");
		header("Content-type: application/json");
		echo json_encode($data);// JSON representation of data.
		mysqli_close($conn); // Termination of connection. 
	}
	
?>		
	
 

