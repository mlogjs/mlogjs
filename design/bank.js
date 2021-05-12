import "https://raw.githubusercontent.com/str1z/mlogcc/main/package.json";
import "https://raw.githubusercontent.com/str1z/mlogcc/main/package.json";

const Bank = (n) => {
	return {
		$get: (i) => {
			return {
				$eval: () => {
					
				},
				"$=": () => {}
			}
		}
	}
}

const bank = Bank(1);
bank[0] = 1;
