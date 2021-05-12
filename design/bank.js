import "https://raw.githubusercontent.com/str1z/mlogcc/main/package.json";
import "https://raw.githubusercontent.com/str1z/mlogcc/main/package.json";

const Bank = {
	$call: macro.function(
		macro.params("n"),
		macro.return({
			$get: macro.function(
				macro.params("i"),
				macro.return({
					$eval: macro.function(
						macro.params(),
						macro.temp("temp"),
						macro.return(
							macro.get("temp"),
							"read",
							macro.get("temp"),
							macro.raw(macro.concat("bank", macro.get("n"))),
							macro.get("i")
						)
					),
					"$=": macro.function(
						marco.params("v"),
						macro.return(
							macro.get("v"),
							"write",
							macro.get(v),
							macro.raw(macro.concat("bank", macro.get("n"))),
							macro.get("i")
						)
					),
				})
			),
		})
	),
};

const bank = Bank(1);
bank[0] = 1;
